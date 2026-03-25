import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import RandomQuote from "@/components/RandomQuote";
import { TasksByDate, TaskPriority } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";
import TaskStats from "@/components/task/TaskStats";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWorkerState } from "@/hooks/useWorkerState";
import { useTaskMutations } from "@/hooks/useTaskMutations";
import { useCategories } from "@/hooks/useCategories";
import { useTaskShortcuts } from "@/hooks/useTaskShortcuts";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Moon, Sun, FolderOpen } from "lucide-react";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import DateRangeSelector, { ViewMode } from "@/components/task/DateRangeSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/components/ThemeProvider";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";

const Index = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const { theme, setTheme } = useTheme();

  const { currentWorker, setCurrentWorker } = useWorkerState();
  const {
    addTaskMutation, deleteTaskMutation, editTaskMutation,
    toggleTaskMutation, updateTaskProgressMutation,
    reorderTasksMutation
  } = useTaskMutations();
  const { categories } = useCategories(workerId);

  if (!workerId) return <Navigate to="/" replace />;

  const getDateRange = () => {
    const now = new Date();
    if (viewMode === "week") {
      return {
        from: format(startOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd"),
        to: format(endOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd"),
      };
    }
    if (viewMode === "month") {
      return {
        from: format(startOfMonth(now), "yyyy-MM-dd"),
        to: format(endOfMonth(now), "yyyy-MM-dd"),
      };
    }
    return null; // "all"
  };

  const { data: teamMember } = useQuery({
    queryKey: ['team-member', workerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members').select('*').eq('worker_id', workerId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!workerId,
  });

  const { data: tasksByDate = {}, isLoading } = useQuery({
    queryKey: ['tasks', workerId, viewMode],
    queryFn: async () => {
      if (!workerId) return {};
      let query = supabase.from("tasks").select("*").eq("worker", workerId).order("timestamp", { ascending: false });
      
      const range = getDateRange();
      if (range) {
        query = query.gte('date', range.from).lte('date', range.to);
      }

      const { data, error } = await query;
      if (error) { toast({ title: "שגיאה בטעינת משימות", description: error.message, variant: "destructive" }); throw error; }

      const tasksByDate: TasksByDate = {};
      data?.forEach((task) => {
        const dateKey = task.date || new Date().toISOString().split('T')[0];
        if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
        const transformedAttachments = (Array.isArray(task.attachments) ? task.attachments : []).map((attachment: any) => ({
          id: attachment.id || crypto.randomUUID(), name: attachment.name || '', url: attachment.url || '', type: attachment.type || 'unknown'
        }));
        tasksByDate[dateKey].push({
          id: task.id, title: task.title, timestamp: task.timestamp || new Date().toISOString(),
          completed: task.completed || false, date: dateKey, duration: task.duration || 0,
          startTime: task.start_time, priority: (task.priority || 'normal') as TaskPriority,
          comments: task.comments || [], attachments: transformedAttachments, worker: task.worker,
          assigned_to: task.assigned_to || [], progress: 0, dependencies: [],
          archived_at: task.archived_at, archived_by: task.archived_by, category_id: task.category_id,
          due_date: task.due_date, notification_time: task.notification_time, offline_id: task.offline_id,
          order_index: task.order_index, reminder_time: task.reminder_time, sync_status: task.sync_status,
          tags: task.tags, voice_note: task.voice_note
        });
      });
      return tasksByDate;
    },
    enabled: !!workerId,
  });

  const { showKeyboardShortcuts } = useTaskShortcuts({
    onAddTask: () => setIsAddingTask(true),
    onToggleFilterCompleted: () => {},
    onSearch: () => {
      const searchInput = document.querySelector('input[type="search"]');
      if (searchInput) (searchInput as HTMLInputElement).focus();
    }
  });

  if (currentWorker !== workerId && workerId) setCurrentWorker(workerId);

  const handleDeleteAllTasksForDate = async (date: string) => {
    try {
      const tasks = tasksByDate[date] || [];
      const taskIds = tasks.map(task => task.id);
      if (taskIds.length === 0) return;
      const { error } = await supabase.from("tasks").delete().in("id", taskIds).eq("worker", workerId || '');
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: "משימות נמחקו", description: `${taskIds.length} משימות נמחקו` });
    } catch (error) {
      toast({ title: "שגיאה במחיקת משימות", description: "לא ניתן למחוק את המשימות", variant: "destructive" });
    }
  };

  const handleTaskComplete = (taskId: string) => {
    toggleTaskMutation.mutate({ taskId, worker: workerId || '' });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleAddTask = (title: string, duration: number, priority: TaskPriority, categoryId?: string) => {
    if (!title.trim()) return;
    const scopeTag = viewMode !== "all" ? `scope:${viewMode}` : undefined;
    addTaskMutation.mutate({ 
      title, duration: duration || 0, priority: priority || "normal", 
      worker: workerId, categoryId,
      tags: scopeTag ? [scopeTag] : undefined,
    });
    setIsAddingTask(false);
  };

  return (
    <ErrorBoundary>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-subtle" dir="rtl"
      >
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:bg-accent"
              size={isMobile ? "sm" : "default"}
            >
              <ArrowRight className="h-4 w-4" />
              חזרה
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/member/${workerId}/categories`)}
                className="rounded-full h-9 w-9 hover:bg-accent"
                title="קטגוריות"
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="rounded-full h-9 w-9 hover:bg-accent"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Profile hero section */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 mb-8"
          >
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-primary/20 ring-offset-4 ring-offset-background shadow-xl">
              <AvatarImage src={teamMember?.avatar_url || undefined} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                <UserRound className="h-10 w-10 sm:h-12 sm:w-12" />
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {teamMember?.name || '...'}
            </h2>
          </motion.div>

          <Header />
          
          <div className="mb-5 max-w-2xl mx-auto">
            <RandomQuote />
          </div>

          <DateRangeSelector viewMode={viewMode} onViewModeChange={setViewMode} />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="glass rounded-2xl p-4 mb-5"
          >
            <TaskForm 
              onAddTask={handleAddTask} 
              categories={categories}
              isOpen={isAddingTask}
              onOpenChange={setIsAddingTask}
              onManageCategories={() => navigate(`/member/${workerId}/categories`)}
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="glass rounded-2xl"
          >
            <TaskList 
              tasks={tasksByDate}
              isLoading={isLoading}
              onToggleTask={(taskId) => toggleTaskMutation.mutate({ taskId, worker: workerId })}
              onTaskComplete={handleTaskComplete}
              onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
              onEditTask={(taskId, newTitle, newDuration, newPriority, categoryId) => 
                editTaskMutation.mutate({ taskId, newTitle, newDuration, newPriority, worker: workerId, categoryId })}
              onDeleteAllTasksForDate={handleDeleteAllTasksForDate}
              onReorderTasks={(date, tasks) => reorderTasksMutation.mutate({ tasks })}
              onUpdateTaskProgress={(taskId, progress) => updateTaskProgressMutation.mutate({ taskId, progress })}
            />
          </motion.div>
          
          <div className="mt-5">
            <TaskStats tasksByDate={tasksByDate} />
          </div>
        </div>
        <Toaster />
      </motion.div>
    </ErrorBoundary>
  );
};

export default Index;
