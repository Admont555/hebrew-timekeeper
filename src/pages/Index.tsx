import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import TaskList from "@/components/TaskList";
import TaskForm from "@/components/TaskForm";
import RandomQuote from "@/components/RandomQuote";
import { Task, TasksByDate } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const Index = () => {
  const [tasksByDate, setTasksByDate] = useState<TasksByDate>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
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
      if (!tasksByDate[task.date]) {
        tasksByDate[task.date] = [];
      }
      tasksByDate[task.date].push({
        ...task,
        timestamp: task.timestamp,
      });
    });

    setTasksByDate(tasksByDate);
  };

  const addTask = async (title: string, duration: number) => {
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

  const editTask = async (taskId: string, newTitle: string, newDuration: number) => {
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
      .update({ title: newTitle, duration: newDuration })
      .eq("id", taskId);

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
      .eq("id", taskId);

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
      .eq("id", taskId);

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
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl font-bold text-right mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400"
        >
          מעקב משימות
        </motion.h1>
        <RandomQuote />
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
      </motion.div>
    </div>
  );
};

export default Index;