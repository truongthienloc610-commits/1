import { useState, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useCalendarEvents, type CalendarEvent, type EventFormData } from "@/hooks/useCalendarEvents";
import { useStudyLogs } from "@/hooks/useStudyLogs";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, addWeeks, subWeeks, setHours, setMinutes,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  ChevronLeft, ChevronRight, Plus, Calendar as CalIcon,
  CheckSquare, Users, Sparkles, Trash2, Pencil, X,
  Clock, Bot, Loader2, Check, CalendarDays, LayoutList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

// --- Màu sự kiện ---
const EVENT_COLORS = [
  "#4285f4", "#34a853", "#ea4335", "#fbbc04",
  "#8e24aa", "#e67c73", "#039be5", "#616161",
];

const EVENT_TYPE_CONFIG = {
  event: { label: "Sự kiện", icon: CalIcon, emoji: "📅" },
  todo: { label: "Việc cần làm", icon: CheckSquare, emoji: "✅" },
  appointment: { label: "Lịch hẹn", icon: Users, emoji: "🤝" },
};

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 7:00 -> 23:00

// ============================================================
// COMPONENT CHÍNH
// ============================================================
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  const {
    events, isLoading, createEvent, updateEvent, deleteEvent,
    toggleComplete, analyzeSchedule, aiInsight, aiLoading, setAiInsight,
  } = useCalendarEvents(currentDate);

  const { data: studyLogs = [] } = useStudyLogs();

  // --- Navigation ---
  const goToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date()); };
  const goPrev = () => setCurrentDate(v => viewMode === "month" ? subMonths(v, 1) : subWeeks(v, 1));
  const goNext = () => setCurrentDate(v => viewMode === "month" ? addMonths(v, 1) : addWeeks(v, 1));

  // --- Computed calendar days ---
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // --- Helpers ---
  const getEventsForDay = useCallback((day: Date) =>
    events.filter(e => isSameDay(new Date(e.start_time), day)),
  [events]);

  const selectedDayEvents = useMemo(() =>
    getEventsForDay(selectedDate),
  [getEventsForDay, selectedDate]);

  // Study log dots
  const getStudyLogsForDay = useCallback((day: Date) =>
    studyLogs.filter((log: any) => isSameDay(new Date(log.logged_at), day)),
  [studyLogs]);

  // --- Handlers ---
  const handleOpenCreate = (date?: Date) => {
    setEditingEvent(null);
    if (date) setSelectedDate(date);
    setDialogOpen(true);
  };

  const handleOpenEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteEvent.mutateAsync(id);
  };

  const handleToggle = async (event: CalendarEvent) => {
    await toggleComplete.mutateAsync({ id: event.id, is_completed: !event.is_completed });
  };

  const handleAIAnalyze = () => {
    setAiPanelOpen(true);
    analyzeSchedule();
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-3rem)]">
        {/* ===== HEADER ===== */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={goPrev} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToday} className="text-xs h-8 px-3">
                Hôm nay
              </Button>
              <Button variant="ghost" size="icon" onClick={goNext} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h1 className="text-lg md:text-xl font-bold capitalize">
              {viewMode === "month"
                ? format(currentDate, "MMMM yyyy", { locale: vi })
                : `Tuần ${format(weekDays[0], "dd/MM")} - ${format(weekDays[6], "dd/MM")}`
              }
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("month")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                  viewMode === "month" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                <CalendarDays className="h-3.5 w-3.5" /> Tháng
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                  viewMode === "week" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                <LayoutList className="h-3.5 w-3.5" /> Tuần
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={handleAIAnalyze}
            >
              <Bot className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">AI Phân tích</span>
            </Button>

            <Button
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={() => handleOpenCreate()}
            >
              <Plus className="h-3.5 w-3.5" /> Thêm
            </Button>
          </div>
        </div>

        {/* ===== CONTENT AREA ===== */}
        <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
          {/* ===== CALENDAR GRID ===== */}
          <div className="flex-1 flex flex-col border bg-card rounded-xl shadow-sm overflow-hidden min-w-0">
            {viewMode === "month" ? (
              <MonthView
                days={calendarDays}
                currentDate={currentDate}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onDoubleClickDate={handleOpenCreate}
                getEventsForDay={getEventsForDay}
                getStudyLogsForDay={getStudyLogsForDay}
              />
            ) : (
              <WeekView
                days={weekDays}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                events={events}
                onClickEvent={handleOpenEdit}
                onClickSlot={handleOpenCreate}
              />
            )}
          </div>

          {/* ===== SIDE PANEL (desktop) ===== */}
          <div className="hidden lg:flex w-80 flex-col gap-4 shrink-0">
            {/* Sự kiện ngày đã chọn */}
            <div className="border bg-card rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-sm">
                  {format(selectedDate, "EEEE, dd/MM", { locale: vi })}
                </h2>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenCreate(selectedDate)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {selectedDayEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                    <CalIcon className="h-8 w-8 opacity-20" />
                    <p className="text-xs">Không có sự kiện</p>
                    <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => handleOpenCreate(selectedDate)}>
                      <Plus className="h-3 w-3" /> Tạo mới
                    </Button>
                  </div>
                ) : (
                  selectedDayEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={handleOpenEdit}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== MOBILE: Sự kiện ngày chọn ===== */}
        {viewMode === "month" && (
          <div className="lg:hidden mt-3 border bg-card rounded-xl shadow-sm shrink-0 max-h-48 overflow-y-auto">
            <div className="p-3 border-b flex items-center justify-between">
              <h2 className="font-semibold text-sm">
                {format(selectedDate, "EEE dd/MM", { locale: vi })}
              </h2>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenCreate(selectedDate)}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="p-2 space-y-1.5">
              {selectedDayEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">Không có sự kiện</p>
              ) : (
                selectedDayEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                    compact
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== DIALOG TẠO/SỬA SỰ KIỆN ===== */}
      <EventDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingEvent(null); }}
        event={editingEvent}
        selectedDate={selectedDate}
        onSubmit={async (data) => {
          if (editingEvent) {
            await updateEvent.mutateAsync({ id: editingEvent.id, ...data });
          } else {
            await createEvent.mutateAsync(data);
          }
          setDialogOpen(false);
          setEditingEvent(null);
        }}
        isSubmitting={createEvent.isPending || updateEvent.isPending}
      />

      {/* ===== AI PANEL ===== */}
      <Dialog open={aiPanelOpen} onOpenChange={setAiPanelOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Phân tích Lịch trình
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            {aiLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Đang phân tích lịch trình...</p>
              </div>
            ) : aiInsight ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                <ReactMarkdown>{aiInsight}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="h-10 w-10 mx-auto opacity-20 mb-3" />
                <p className="text-sm">Nhấn phân tích để bắt đầu</p>
              </div>
            )}
          </div>
          {!aiLoading && (
            <Button className="w-full gap-2 mt-2" onClick={analyzeSchedule}>
              <Sparkles className="h-4 w-4" />
              {aiInsight ? "Phân tích lại" : "Bắt đầu phân tích"}
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

// ============================================================
// MONTH VIEW
// ============================================================
function MonthView({
  days, currentDate, selectedDate, onSelectDate, onDoubleClickDate,
  getEventsForDay, getStudyLogsForDay,
}: {
  days: Date[];
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onDoubleClickDate: (d: Date) => void;
  getEventsForDay: (d: Date) => CalendarEvent[];
  getStudyLogsForDay: (d: Date) => any[];
}) {
  const weekLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="grid grid-cols-7 border-b">
        {weekLabels.map(label => (
          <div key={label} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {label}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const dayStudy = getStudyLogsForDay(day);
          const inMonth = isSameMonth(day, currentDate);
          const selected = isSameDay(day, selectedDate);
          const today = isToday(day);

          return (
            <div
              key={idx}
              className={cn(
                "border-b border-r p-1 cursor-pointer transition-colors min-h-[4.5rem] relative group",
                !inMonth && "bg-muted/30",
                selected && "bg-primary/5 ring-1 ring-primary/30 ring-inset",
                "hover:bg-muted/40"
              )}
              onClick={() => onSelectDate(day)}
              onDoubleClick={() => onDoubleClickDate(day)}
            >
              {/* Ngày */}
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium",
                  today && "bg-primary text-primary-foreground",
                  !inMonth && "text-muted-foreground/50",
                )}>
                  {format(day, "d")}
                </span>
                {/* Study indicator */}
                {dayStudy.length > 0 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1" title="Có học" />
                )}
              </div>

              {/* Events dots/chips */}
              <div className="mt-0.5 space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 3).map(e => (
                  <div
                    key={e.id}
                    className={cn(
                      "text-[10px] leading-tight px-1.5 py-0.5 rounded truncate font-medium",
                      e.is_completed && "line-through opacity-60"
                    )}
                    style={{ backgroundColor: e.color + "22", color: e.color }}
                  >
                    {e.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground pl-1.5">
                    +{dayEvents.length - 3} khác
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// WEEK VIEW (Timeline)
// ============================================================
function WeekView({
  days, selectedDate, onSelectDate, events, onClickEvent, onClickSlot,
}: {
  days: Date[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  events: CalendarEvent[];
  onClickEvent: (e: CalendarEvent) => void;
  onClickSlot: (d: Date) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header ngày */}
      <div className="grid grid-cols-[3rem_repeat(7,1fr)] border-b shrink-0">
        <div />
        {days.map((day, i) => (
          <div
            key={i}
            className={cn(
              "py-2 text-center cursor-pointer border-l transition-colors",
              isSameDay(day, selectedDate) && "bg-primary/5",
              isToday(day) && "font-bold"
            )}
            onClick={() => onSelectDate(day)}
          >
            <div className="text-[10px] text-muted-foreground uppercase">
              {format(day, "EEE", { locale: vi })}
            </div>
            <div className={cn(
              "text-sm w-7 h-7 mx-auto flex items-center justify-center rounded-full",
              isToday(day) && "bg-primary text-primary-foreground"
            )}>
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[3rem_repeat(7,1fr)] min-h-[68rem]">
          {/* Hour labels */}
          <div className="relative">
            {HOURS.map(hour => (
              <div
                key={hour}
                className="h-16 border-b flex items-start justify-end pr-2 pt-0.5"
              >
                <span className="text-[10px] text-muted-foreground">{String(hour).padStart(2, "0")}:00</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, dayIdx) => {
            const dayEvents = events.filter(e => isSameDay(new Date(e.start_time), day));

            return (
              <div key={dayIdx} className="relative border-l">
                {/* Hour grid lines */}
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    className="h-16 border-b hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => {
                      const d = setMinutes(setHours(day, hour), 0);
                      onClickSlot(d);
                    }}
                  />
                ))}

                {/* Events positioned absolutely */}
                {dayEvents.map(event => {
                  const startH = new Date(event.start_time).getHours();
                  const startM = new Date(event.start_time).getMinutes();
                  const endH = new Date(event.end_time).getHours();
                  const endM = new Date(event.end_time).getMinutes();

                  const top = ((startH - 7) * 64) + (startM / 60 * 64);
                  const height = Math.max(((endH - startH) * 64) + ((endM - startM) / 60 * 64), 20);

                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 cursor-pointer text-white text-[10px] leading-tight overflow-hidden z-10 hover:opacity-90 transition-opacity shadow-sm",
                        event.is_completed && "opacity-60"
                      )}
                      style={{
                        top: `${Math.max(top, 0)}px`,
                        height: `${height}px`,
                        backgroundColor: event.color,
                      }}
                      onClick={(e) => { e.stopPropagation(); onClickEvent(event); }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="opacity-80">
                        {format(new Date(event.start_time), "HH:mm")} - {format(new Date(event.end_time), "HH:mm")}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EVENT CARD (sidebar)
// ============================================================
function EventCard({
  event, onEdit, onDelete, onToggle, compact = false,
}: {
  event: CalendarEvent;
  onEdit: (e: CalendarEvent) => void;
  onDelete: (id: string) => void;
  onToggle: (e: CalendarEvent) => void;
  compact?: boolean;
}) {
  const typeConfig = EVENT_TYPE_CONFIG[event.event_type];

  return (
    <div
      className={cn(
        "group flex items-start gap-2 rounded-lg border p-2.5 transition-all hover:shadow-sm",
        event.is_completed && "opacity-60",
        compact && "p-2"
      )}
      style={{ borderLeftColor: event.color, borderLeftWidth: "3px" }}
    >
      {/* Checkbox */}
      <button
        className={cn(
          "mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors",
          event.is_completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40 hover:border-primary"
        )}
        onClick={() => onToggle(event)}
      >
        {event.is_completed && <Check className="h-3 w-3" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate",
          event.is_completed && "line-through"
        )}>
          {event.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {format(new Date(event.start_time), "HH:mm")} - {format(new Date(event.end_time), "HH:mm")}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted font-medium">
            {typeConfig.emoji} {typeConfig.label}
          </span>
        </div>
        {event.description && !compact && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
        <button className="p-1 rounded hover:bg-muted transition-colors" onClick={() => onEdit(event)}>
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </button>
        <button className="p-1 rounded hover:bg-destructive/10 transition-colors" onClick={() => onDelete(event.id)}>
          <Trash2 className="h-3 w-3 text-destructive" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// EVENT DIALOG (Tạo/Sửa sự kiện)
// ============================================================
function EventDialog({
  open, onClose, event, selectedDate, onSubmit, isSubmitting,
}: {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  selectedDate: Date;
  onSubmit: (data: EventFormData) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<"event" | "todo" | "appointment">("event");
  const [dateStr, setDateStr] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [color, setColor] = useState("#4285f4");
  const [description, setDescription] = useState("");

  // Reset khi dialog mở
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      if (event) {
        setTitle(event.title);
        setEventType(event.event_type);
        setDateStr(format(new Date(event.start_time), "yyyy-MM-dd"));
        setStartTime(format(new Date(event.start_time), "HH:mm"));
        setEndTime(format(new Date(event.end_time), "HH:mm"));
        setColor(event.color);
        setDescription(event.description);
      } else {
        setTitle("");
        setEventType("event");
        setDateStr(format(selectedDate, "yyyy-MM-dd"));
        setStartTime("09:00");
        setEndTime("10:00");
        setColor("#4285f4");
        setDescription("");
      }
    } else {
      onClose();
    }
  };

  // Gọi khi dialog mount / event thay đổi
  useState(() => {
    handleOpenChange(open);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateStr) return;

    const start_time = new Date(`${dateStr}T${startTime}:00`).toISOString();
    const end_time = new Date(`${dateStr}T${endTime}:00`).toISOString();

    await onSubmit({
      title: title.trim(),
      event_type: eventType,
      start_time,
      end_time,
      color,
      description,
      is_completed: event?.is_completed ?? false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md" onOpenAutoFocus={() => handleOpenChange(true)}>
        <DialogHeader>
          <DialogTitle>{event ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tiêu đề */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Tiêu đề</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ví dụ: Ôn tập Toán chương 3..."
              required
              autoFocus
            />
          </div>

          {/* Loại sự kiện */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Loại</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(EVENT_TYPE_CONFIG) as [string, any][]).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  className={cn(
                    "flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs font-medium transition-all",
                    eventType === key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted hover:border-muted-foreground/30"
                  )}
                  onClick={() => setEventType(key as any)}
                >
                  <span className="text-base">{cfg.emoji}</span>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ngày + Giờ */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Ngày</label>
              <Input
                type="date"
                value={dateStr}
                onChange={e => setDateStr(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Từ</label>
              <Input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Đến</label>
              <Input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Màu */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Màu sự kiện</label>
            <div className="flex gap-2">
              {EVENT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    "w-7 h-7 rounded-full transition-all border-2",
                    color === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Mô tả (tùy chọn)</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ghi chú thêm..."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="flex-1 gap-1.5" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {event ? "Cập nhật" : "Tạo sự kiện"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
