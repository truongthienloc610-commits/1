import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { subDays, startOfDay, format } from "date-fns";

export interface StudyLog {
  id: string;
  user_id: string;
  subject: string;
  duration_minutes: number;
  logged_at: string;
}

export interface DailyStudyData {
  date: string;
  label: string;
  minutes: number;
}

export function useStudyLogs() {
  const { user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  // Last 30 days logs to calculate streak and total
  const query = useQuery({
    queryKey: ["study-logs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const since = subDays(new Date(), 30).toISOString();
      const { data, error } = await supabase
        .from("study_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_at", since)
        .order("logged_at", { ascending: true });
      if (error) throw error;
      return data as StudyLog[];
    },
    enabled: !!user,
  });

  // Transform to daily aggregated data for chart (Last 7 days)
  const dailyData: DailyStudyData[] = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(startOfDay(date), "yyyy-MM-dd");
    const dayLogs = (query.data ?? []).filter(
      (log) => format(new Date(log.logged_at), "yyyy-MM-dd") === dateStr
    );
    const minutes = dayLogs.reduce((sum, l) => sum + l.duration_minutes, 0);
    return {
      date: dateStr,
      label: format(date, "EEE"),
      minutes,
    };
  });

  // Calculate calculated metrics
  const calculatedTotalMinutes = (query.data ?? []).reduce((sum, l) => sum + l.duration_minutes, 0);
  
  // Calculate streak from logs
  const getStreak = () => {
    if (!query.data || query.data.length === 0) return 0;
    
    const activeDates = new Set(
      query.data.map(l => format(new Date(l.logged_at), "yyyy-MM-dd"))
    );
    
    let streak = 0;
    let curr = new Date();
    
    // Check today
    if (activeDates.has(format(curr, "yyyy-MM-dd"))) {
      streak++;
    } else {
      // If not logged today, check yesterday to see if streak is still alive
      curr = subDays(curr, 1);
      if (!activeDates.has(format(curr, "yyyy-MM-dd"))) return 0;
      streak++;
    }
    
    // Continue counting backwards
    while (true) {
      curr = subDays(curr, 1);
      if (activeDates.has(format(curr, "yyyy-MM-dd"))) {
        streak++;
      } else {
        break;
      }
      if (streak > 30) break; // Cap at 30 for the current query range
    }
    return streak;
  };

  const calculatedStreak = getStreak();

  const logStudy = useMutation({
    mutationFn: async (params: { subject: string; duration_minutes: number }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("study_logs").insert({
        user_id: user.id,
        subject: params.subject,
        duration_minutes: params.duration_minutes,
      });
      if (error) throw error;

      // Update profile total_study_minutes and streak (Sync effort)
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("total_study_minutes, streak_days, last_active")
          .eq("id", user.id)
          .single();

        if (profile) {
          const todayStr = new Date().toISOString().split("T")[0];
          const lastActiveStr = profile.last_active ? new Date(profile.last_active).toISOString().split("T")[0] : null;
          
          let newStreak = profile.streak_days || 0;
          if (lastActiveStr !== todayStr) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];

            if (lastActiveStr === yesterdayStr) {
              newStreak += 1;
            } else {
              newStreak = 1;
            }
          }

          await supabase
            .from("profiles")
            .update({ 
              total_study_minutes: (profile.total_study_minutes || 0) + params.duration_minutes,
              streak_days: Math.max(newStreak, 1),
              last_active: new Date().toISOString()
            })
            .eq("id", user.id);
        }
      } catch (err) {
        console.warn("Profile sync failed, but study was logged:", err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-logs", user?.id] });
      // Important: refresh local profile state
      refreshProfile();
    },
  });

  return { ...query, dailyData, logStudy, calculatedTotalMinutes, calculatedStreak };
}
