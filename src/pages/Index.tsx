import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import RandomQuote from "@/components/RandomQuote";
import { TasksByDate, TaskPriority } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ErrorBoundary from "@/components/ErrorBoundary";
import TaskHeader from "@/components/task/TaskHeader";
import TaskStats from "@/components/task/TaskStats";
import TaskContainer from "@/components/task/TaskContainer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface WorkerNames {
  worker1: string;
  worker2: string;
}

const Index = () => {
  const [currentWorker, setCurrentWorker] = useState<'worker1' | 'worker2'>('worker1');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'duration'>('date');
  const [workerNames, setWorkerNames] = useState<WorkerNames>(() => {
    const saved = localStorage.getItem('workerNames');
    return saved ? JSON.parse(saved) : { worker1: 'עובד 1', worker2: 'עובד 2' };
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    localStorage.setItem('workerNames', JSON.stringify(workerNames));
  }, [workerNames]);

  const { data: tasksByDate = {}, isLoading } = useQuery({
    queryKey: ['tasks', currentWorker],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq('worker', currentWorker)
        .order("timestamp", { ascending: false });

      if (error) {
        toast({
          title: "שגיאה בטעינת משימות",
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
        tasksByDate[dateKey].push({
          ...task,
          priority: (task.priority || 'normal') as TaskPriority,
          timestamp: task.timestamp || new Date().toISOString(),
          completed: task.completed || false,
          duration: task.duration || 0,
        });
      });

      return tasksByDate;
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: async ({ title, duration, priority }: { title: string; duration: number; priority: TaskPriority }) => {
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      
      const newTask = {
        title,
        timestamp: now.toISOString(),
        completed: false,
        date: dateStr,
        duration,
        priority,
        worker: currentWorker,
      };

      const { error } = await supabase
        .from("tasks")
        .insert(newTask);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "משימה נוספה",
        description: "המשימה החדשה נוספה בהצלחה",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בהוספת משימה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "משימה נמחקה",
        description: "המשימה נמחקה בהצלחה",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה במחיקת משימה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const editTaskMutation = useMutation({
    mutationFn: async ({ taskId, newTitle, newDuration, newPriority }: { 
      taskId: string; 
      newTitle: string; 
      newDuration: number; 
      newPriority: TaskPriority 
    }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ 
          title: newTitle, 
          duration: newDuration,
          priority: newPriority
        })
        .eq("id", taskId)
        .eq('worker', currentWorker);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "משימה עודכנה",
        description: "המשימה עודכנה בהצלחה",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בעדכון משימה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const task = Object.values(tasksByDate)
        .flat()
        .find(t => t.id === taskId);
      
      if (!task) throw new Error("Task not found");

      const { error } = await supabase
        .from("tasks")
        .update({ 
          completed: !task.completed,
          start_time: !task.startTime && !task.completed ? new Date().toISOString() : task.startTime
        })
        .eq("id", taskId)
        .eq('worker', currentWorker);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בעדכון משימה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleWorkerNameChange = (workerId: 'worker1' | 'worker2', newName: string) => {
    setWorkerNames(prev => ({
      ...prev,
      [workerId]: newName
    }));
  };

  return (
    <ErrorBoundary>
      <div className="scroll-container safe-area-top safe-area-bottom min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Header />
          
          <div className="mb-6 max-w-2xl mx-auto">
            <RandomQuote />
          </div>
          
          <TaskHeader
            currentWorker={currentWorker}
            workerNames={workerNames}
            onWorkerChange={setCurrentWorker}
            onWorkerNameChange={handleWorkerNameChange}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onAddTask={(title, duration, priority) => addTaskMutation.mutate({ title, duration, priority })}
            tasksByDate={tasksByDate}
            isLoading={isLoading}
          />
          
          <TaskStats tasksByDate={tasksByDate} />
          
          <TaskContainer
            tasksByDate={tasksByDate}
            isLoading={isLoading}
            onToggleTask={(taskId) => toggleTaskMutation.mutate(taskId)}
            onTaskComplete={(taskId) => toggleTaskMutation.mutate(taskId)}
            onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
            onEditTask={(taskId, newTitle, newDuration, newPriority) => 
              editTaskMutation.mutate({ taskId, newTitle, newDuration, newPriority })}
          />
        </div>
        <Toaster />
      </div>
    </ErrorBoundary>
  );
};

export default Index;