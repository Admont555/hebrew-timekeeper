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
import { ArrowLeft, Keyboard } from "lucide-react";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import DateRangeSelector from "@/components/task/DateRangeSelector";
import { NavMenu } from "@/components/NavMenu";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [isAddingTask, setIsAddingTask] = useState(false);

  const {
    currentWorker,
    setCurrentWorker,
    workerNames,
  } = useWorkerState();

  if (currentWorker !== workerId && workerId) {
    setCurrentWorker(workerId);
  }

  const {
    addTaskMutation,
    deleteTaskMutation,
    editTaskMutation,
    toggleTaskMutation,
    updateTaskProgressMutation,
    updateTaskDependenciesMutation,
    reorderTasksMutation
  } = useTaskMutations();

  const { data: teamMember } = useQuery({
    queryKey: ['team-member', workerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('worker_id', workerId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: tasksByDate = {}, isLoading } = useQuery({
    queryKey: ['tasks', workerId, selectedDate],
    queryFn: async () => {
      let query = supabase
        .from("tasks")
        .select("*")
        .or(`worker.eq.${workerId},assigned_to.cs.{${workerId}}`)
        .order("timestamp", { ascending: false });

      if (selectedDate) {
        query = query.eq('date', selectedDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "שגי��ה בטעינת משימות",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      const tasksByDate: TasksByDate = {};
      data?.forEach((task) => {
        const dateKey = task.date || new Date().toISOString().split('T')[0];
        if (!tasksByDate[dateKey]) {
          tasksByDate[dateKey] = [];
        }

        const transformedAttachments = task.attachments?.map((attachment: any) => ({
          id: attachment.id || crypto.randomUUID(),
          name: attachment.name || '',
          url: attachment.url || '',
          type: attachment.type || 'unknown'
        })) || [];

        tasksByDate[dateKey].push({
          id: task.id,
          title: task.title,
          timestamp: task.timestamp || new Date().toISOString(),
          completed: task.completed || false,
          date: dateKey,
          duration: task.duration || 0,
          startTime: task.start_time,
          priority: (task.priority || 'normal') as TaskPriority,
          comments: task.comments || [],
          attachments: transformedAttachments,
          worker: task.worker,
          assigned_to: task.assigned_to || [],
          progress: task.hasOwnProperty('progress') ? task.progress : 0,
          dependencies: task.hasOwnProperty('dependencies') ? task.dependencies : [],
          archived_at: task.archived_at,
          archived_by: task.archived_by,
          category_id: task.category_id,
          due_date: task.due_date,
          notification_time: task.notification_time,
          offline_id: task.offline_id,
          order_index: task.order_index,
          reminder_time: task.reminder_time,
          sync_status: task.sync_status,
          tags: task.tags,
          voice_note: task.voice_note
        });
      });

      return tasksByDate;
    },
  });

  // Setup keyboard shortcuts
  const { showKeyboardShortcuts } = useTaskShortcuts({
    onAddTask: () => setIsAddingTask(true),
    onToggleFilterCompleted: () => {
      toast({
        title: "קיצור מקלדת",
        description: "סינון משימות לפי סטטוס",
      });
    },
    onSearch: () => {
      const searchInput = document.querySelector('input[type="search"]');
      if (searchInput) {
        (searchInput as HTMLInputElement).focus();
      } else {
        toast({
          title: "חיפוש",
          description: "לחץ על כפתור החיפוש להפעלת חיפוש",
        });
      }
    }
  });

  const handleDeleteAllTasksForDate = async (date: string) => {
    try {
      const tasks = tasksByDate[date] || [];
      const taskIds = tasks.map(task => task.id);
      
      if (taskIds.length === 0) return;
      
      const { error } = await supabase
        .from("tasks")
        .delete()
        .in("id", taskIds)
        .eq("worker", workerId || '');
      
      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      toast({
        title: "משימות נמחקו",
        description: `${taskIds.length} משימות נמחקו מתאריך ${new Date(date).toLocaleDateString()}`,
      });
    } catch (error) {
      console.error('Error deleting tasks:', error);
      toast({
        title: "שגיאה במחיקת משימות",
        description: "לא ניתן למחוק את המשימות",
        variant: "destructive",
      });
    }
  };

  const handleTaskComplete = (taskId: string) => {
    toggleTaskMutation.mutate({ taskId, worker: workerId || '' });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleReorderTasks = (date: string, tasks: Task[]) => {
    // Update the local state first for instant feedback
    const updatedTasksByDate = { ...tasksByDate };
    updatedTasksByDate[date] = tasks;
    
    // Then sync with the server
    reorderTasksMutation.mutate({ tasks });
  };

  const handleUpdateTaskDependencies = (taskId: string, dependencies: string[]) => {
    updateTaskDependenciesMutation.mutate({ taskId, dependencies });
  };

  const handleUpdateTaskProgress = (taskId: string, progress: number) => {
    updateTaskProgressMutation.mutate({ taskId, progress });
  };

  const handleAddTask = (title: string, duration: number, priority: TaskPriority) => {
    addTaskMutation.mutate({ title, duration, priority, worker: workerId });
    setIsAddingTask(false); // Close the form after submission
  };

  if (!workerId) {
    return <Navigate to="/" />;
  }

  return (
    <ErrorBoundary>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="scroll-container safe-area-top safe-area-bottom min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300"
      >
        <NavMenu />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6 mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm sm:text-base"
              size={isMobile ? "sm" : "default"}
            >
              <ArrowLeft className="h-4 w-4" />
              חזרה לצוות
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold truncate max-w-[200px] sm:max-w-none">
              {teamMember?.name || 'Loading...'}
            </h1>
            <Button 
              variant="ghost" 
              onClick={showKeyboardShortcuts}
              className="text-sm flex items-center gap-1"
              size="sm"
            >
              <Keyboard className="h-4 w-4" />
              <span className="hidden sm:inline">קיצורי מקלדת</span>
            </Button>
          </div>

          <Header />
          
          <div className="mb-4 sm:mb-6 max-w-2xl mx-auto">
            <RandomQuote />
          </div>

          <DateRangeSelector date={selectedDate} onDateChange={setSelectedDate} />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6 hover:shadow-xl transition-shadow duration-300"
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
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <TaskList 
              tasks={tasksByDate}
              isLoading={isLoading}
              onToggleTask={(taskId) => toggleTaskMutation.mutate({ taskId, worker: workerId })}
              onTaskComplete={handleTaskComplete}
              onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
              onEditTask={(taskId, newTitle, newDuration, newPriority) => 
                editTaskMutation.mutate({ taskId, newTitle, newDuration, newPriority, worker: workerId })}
              onDeleteAllTasksForDate={handleDeleteAllTasksForDate}
              onReorderTasks={handleReorderTasks}
              onUpdateTaskDependencies={handleUpdateTaskDependencies}
              onUpdateTaskProgress={handleUpdateTaskProgress}
            />
          </motion.div>
          
          <div className="grid gap-4 sm:gap-6 mt-4 sm:mt-6">
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
