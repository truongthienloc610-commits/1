import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Save, Flame, Clock, Star } from "lucide-react";

export default function Profile() {
  const { profile: authProfile, signOut } = useAuth();
  const { data: profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [grade, setGrade] = useState(String(profile?.grade ?? ""));
  const [saving, setSaving] = useState(false);

  // Sync state when profile loads
  const currentName = profile?.full_name ?? authProfile?.full_name ?? "";
  const currentGrade = String(profile?.grade ?? authProfile?.grade ?? "");

  const initials = currentName
    ? currentName.split(" ").map((n: string) => n[0]).slice(-2).join("").toUpperCase()
    : "U";

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        full_name: fullName || currentName,
        grade: grade ? parseInt(grade) as 6|7|8|9|10|11|12 : profile?.grade ?? null,
      });
      toast({ title: "Cập nhật thành công!" });
    } catch {
      toast({ title: "Lỗi khi cập nhật", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const stats = [
    { label: "Chuỗi học", value: `${profile?.streak_days ?? 0} ngày`, icon: Flame, color: "text-orange-500" },
    {
      label: "Tổng giờ học",
      value: `${Math.floor((profile?.total_study_minutes ?? 0) / 60)}h ${(profile?.total_study_minutes ?? 0) % 60}m`,
      icon: Clock,
      color: "text-blue-500",
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Hồ sơ của tôi</h1>

        {/* Avatar + stats */}
        <div className="bg-card border rounded-xl p-6 mb-5">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{currentName || "Học sinh"}</h2>
              <p className="text-muted-foreground text-sm">
                {currentGrade ? `Lớp ${currentGrade}` : "Chưa đặt lớp"}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-muted/50 rounded-lg p-3 text-center">
                <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                <p className="text-sm font-semibold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-card border rounded-xl p-6 mb-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <User className="h-4 w-4" /> Thông tin cá nhân
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Họ và tên</Label>
              <Input
                id="profile-name"
                value={fullName || currentName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="space-y-2">
              <Label>Lớp</Label>
              <Select value={grade || currentGrade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lớp" />
                </SelectTrigger>
                <SelectContent>
                  {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <SelectItem key={g} value={String(g)}>Lớp {g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-semibold mb-3">Tài khoản</h3>
          <Button
            variant="outline"
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
