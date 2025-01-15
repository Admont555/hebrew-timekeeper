import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import TaskList from "@/components/TaskList";
import TaskForm from "@/components/TaskForm";
import RandomQuote from "@/components/RandomQuote";
import { Task, TasksByDate, TaskPriority } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [tasksByDate, setTasksByDate] = useState<TasksByDate>({});
  const [currentWorker, setCurrentWorker] = useState<'worker1' | 'worker2'>('worker1');
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, [currentWorker]);

  const fetchTasks = async () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6 max-w-4xl"
      >
        <h1 
          className="text-center text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 animate-gradient bg-clip-text text-transparent bg-[length:200%_auto] dark:from-purple-400 dark:via-blue-300 dark:to-purple-400"
        >
          מעקב משימות
        </h1>
        <RandomQuote />
        
        <Tabs defaultValue="worker1" className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="worker1"
              onClick={() => setCurrentWorker('worker1')}
            >
              עובד 1
            </TabsTrigger>
            <TabsTrigger 
              value="worker2"
              onClick={() => setCurrentWorker('worker2')}
            >
              עובד 2
            </TabsTrigger>
          </TabsList>

          <TabsContent value="worker1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-xl shadow-lg p-6 mb-6 hover:shadow-xl transition-shadow duration-300"
            >
              <TaskForm onAddTask={addTask} />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <TaskList 
                tasks={tasksByDate} 
                onToggleTask={toggleTask}
                onTaskComplete={handleTaskComplete}
                onDeleteTask={deleteTask}
                onEditTask={editTask}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="worker2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-xl shadow-lg p-6 mb-6 hover:shadow-xl transition-shadow duration-300"
            >
              <TaskForm onAddTask={addTask} />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <TaskList 
                tasks={tasksByDate} 
                onToggleTask={toggleTask}
                onTaskComplete={handleTaskComplete}
                onDeleteTask={deleteTask}
                onEditTask={editTask}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
      <Toaster />
    </div>
  );
};

export default Index;