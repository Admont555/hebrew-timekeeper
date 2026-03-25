import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import RandomQuote from "@/components/RandomQuote";
import { TasksByDate, TaskPriority, Task } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ErrorBoundary from "@/components/ErrorBoundary";
import TaskStats from "@/components/task/TaskStats";
import TaskAnalytics from "@/components/task/TaskAnalytics";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWorkerState } from "@/hooks/useWorkerState";
import { useTaskMutations } from "@/hooks/useTaskMutations";
import { useTaskShortcuts } from "@/hooks/useTaskShortcuts";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Moon, Sun } from "lucide-react";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import DateRangeSelector from "@/components/task/DateRangeSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/components/ThemeProvider";

const Index = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>();
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
    updateTaskDependenciesMutation, reorderTasksMutation
  } = useTaskMutations();

  if (!workerId) return <Navigate to="/" replace />;

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
    queryKey: ['tasks', workerId, selectedDate],
    queryFn: async () => {
      if (!workerId) return {};
      let query = supabase.from("tasks").select("*").eq("worker", workerId).order("timestamp", { ascending: false });
      if (selectedDate) query = query.eq('date', selectedDate.toISOString().split('T')[0]);
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
    addTaskMutation.mutate({ title, duration: duration || 0, priority: priority || "normal", worker: workerId, categoryId });
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
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:bg-accent"
              size={isMobile ? "sm" : "default"}
            >
              <ArrowRight className="h-4 w-4" />
              חזרה
            </Button>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
              {teamMember?.name || '...'}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="rounded-full h-9 w-9 hover:bg-accent"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          <Header />
          
          <div className="mb-5 max-w-2xl mx-auto">
            <RandomQuote />
          </div>

          <DateRangeSelector date={selectedDate} onDateChange={setSelectedDate} />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="glass rounded-2xl p-4 mb-5"
          >
            <TaskForm 
              onAddTask={handleAddTask} 
              isOpen={isAddingTask}
              onOpenChange={setIsAddingTask}
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
              onUpdateTaskDependencies={(taskId, deps) => updateTaskDependenciesMutation.mutate({ taskId, dependencies: deps })}
              onUpdateTaskProgress={(taskId, progress) => updateTaskProgressMutation.mutate({ taskId, progress })}
            />
          </motion.div>
          
          <div className="grid gap-5 mt-5">
            <TaskStats tasksByDate={tasksByDate} />
            <TaskAnalytics tasksByDate={tasksByDate} />
          </div>
        </div>
        <Toaster />
      </motion.div>
    </ErrorBoundary>
  );
};

export default Index;
