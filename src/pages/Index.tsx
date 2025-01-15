import { useEffect, useState } from "react";
import TaskList from "@/components/TaskList";
import TaskForm from "@/components/TaskForm";
import RandomQuote from "@/components/RandomQuote";
import { Task, TasksByDate } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const Index = () => {
  const [tasksByDate, setTasksByDate] = useState<TasksByDate>({});
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchTasks();
    }
  }, [session?.user]);

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
      user_id: session.user.id,
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

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto p-6 max-w-md">
          <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
            מעקב משימות
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={["google"]}
              localization={{
                variables: {
                  sign_in: {
                    email_label: "דוא״ל",
                    password_label: "סיסמה",
                    button_label: "כניסה",
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            התנתק
          </button>
          <h1 className="text-4xl font-bold text-right bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
            מעקב משימות
          </h1>
        </div>
        <RandomQuote />
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <TaskForm onAddTask={addTask} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <TaskList 
            tasks={tasksByDate} 
            onToggleTask={toggleTask}
            onTaskComplete={handleTaskComplete}
            onDeleteTask={deleteTask}
            onEditTask={editTask}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;