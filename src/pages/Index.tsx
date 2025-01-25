import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import RandomQuote from "@/components/RandomQuote";
import { Task, TasksByDate, TaskPriority } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import WorkerTabs from "@/components/WorkerTabs";
import TaskFilters from "@/components/task/TaskFilters";
import ErrorBoundary from "@/components/ErrorBoundary";

interface WorkerNames {
  worker1: string;
  worker2: string;
}

const Index = () => {
  const [tasksByDate, setTasksByDate] = useState<TasksByDate>({});
  const [currentWorker, setCurrentWorker] = useState<'worker1' | 'worker2'>('worker1');
  const [isLoading, setIsLoading] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'duration'>('date');
  const [workerNames, setWorkerNames] = useState<WorkerNames>(() => {
    const saved = localStorage.getItem('workerNames');
    return saved ? JSON.parse(saved) : { worker1: 'עובד 1', worker2: 'עובד 2' };
  });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('workerNames', JSON.stringify(workerNames));
  }, [workerNames]);

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorker]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
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
        return;
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

      setTasksByDate(tasksByDate);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (title: string, duration: number, priority: TaskPriority) => {
    if (!title.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין כותרת למשימה",
        variant: "destructive",
      });
      return;
    }

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

    if (error) {
      toast({
        title: "שגיאה בהוספת משימה",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    fetchTasks();
    toast({
      title: "משימה נוספה",
      description: "המשימה החדשה נוספה בהצלחה",
    });
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      toast({
        title: "שגיאה במחיקת משימה",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    fetchTasks();
    toast({
      title: "משימה נמחקה",
      description: "המשימה נמחקה בהצלחה",
    });
  };

  const editTask = async (taskId: string, newTitle: string, newDuration: number, newPriority: TaskPriority) => {
    if (!newTitle.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין כותרת למשימה",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("tasks")
      .update({ 
        title: newTitle, 
        duration: newDuration,
        priority: newPriority
      })
      .eq("id", taskId)
      .eq('worker', currentWorker);

    if (error) {
      toast({
        title: "שגיאה בעדכון משימה",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    fetchTasks();
    toast({
      title: "משימה עודכנה",
      description: "המשימה עודכנה בהצלחה",
    });
  };

  const toggleTask = async (taskId: string) => {
    const dateKey = Object.keys(tasksByDate).find(date => 
      tasksByDate[date].some(task => task.id === taskId)
    );
    
    if (!dateKey) return;
    
    const task = tasksByDate[dateKey].find(t => t.id === taskId);
    if (!task) return;

    const { error } = await supabase
      .from("tasks")
      .update({ 
        completed: !task.completed,
        start_time: !task.startTime && !task.completed ? new Date().toISOString() : task.startTime
      })
      .eq("id", taskId)
      .eq('worker', currentWorker);

    if (error) {
      toast({
        title: "שגיאה בעדכון משימה",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    fetchTasks();
  };

  const handleTaskComplete = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: true })
      .eq("id", taskId)
      .eq('worker', currentWorker);

    if (error) {
      toast({
        title: "שגיאה בעדכון משימה",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    fetchTasks();
  };

  const handleWorkerNameChange = (workerId: 'worker1' | 'worker2', newName: string) => {
    setWorkerNames(prev => ({
      ...prev,
      [workerId]: newName
    }));
  };

  const filteredAndSortedTasks = (tasks: Task[]) => {
    let filtered = tasks;
    
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 0, normal: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'duration':
          return b.duration - a.duration;
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });
  };

  return (
    <ErrorBoundary>
      <div className="scroll-container safe-area-top safe-area-bottom min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Header />
          
          <div className="mb-6 max-w-2xl mx-auto">
            <RandomQuote />
          </div>
          
          <TaskFilters
            priority={priorityFilter}
            onPriorityChange={setPriorityFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
          
          <WorkerTabs 
            currentWorker={currentWorker}
            workerNames={workerNames}
            onWorkerChange={(value: 'worker1' | 'worker2') => setCurrentWorker(value)}
            onWorkerNameChange={handleWorkerNameChange}
            onAddTask={addTask}
            tasksByDate={Object.fromEntries(
              Object.entries(tasksByDate).map(([date, tasks]) => [
                date,
                filteredAndSortedTasks(tasks)
              ])
            )}
            isLoading={isLoading}
            onToggleTask={toggleTask}
            onTaskComplete={handleTaskComplete}
            onDeleteTask={deleteTask}
            onEditTask={editTask}
          />
        </div>
        <Toaster />
      </div>
    </ErrorBoundary>
  );
};

export default Index;
