import { useEffect, useState } from "react";
import TaskList from "@/components/TaskList";
import TaskForm from "@/components/TaskForm";
import { Task, TasksByDate } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [tasksByDate, setTasksByDate] = useState<TasksByDate>({});
  const { toast } = useToast();

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasksByDate(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasksByDate));
  }, [tasksByDate]);

  const addTask = (title: string, duration: number) => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      timestamp: now.toISOString(),
      completed: false,
      date: dateStr,
      duration,
    };

    setTasksByDate((prev) => {
      const updatedTasks = { ...prev };
      if (!updatedTasks[dateStr]) {
        updatedTasks[dateStr] = [];
      }
      updatedTasks[dateStr] = [...updatedTasks[dateStr], newTask];
      return updatedTasks;
    });

    toast({
      title: "משימה נוספה",
      description: "המשימה החדשה נוספה בהצלחה",
    });
  };

  const deleteTask = (taskId: string) => {
    setTasksByDate((prev) => {
      const updatedTasks = { ...prev };
      for (const date in updatedTasks) {
        updatedTasks[date] = updatedTasks[date].filter((t) => t.id !== taskId);
        if (updatedTasks[date].length === 0) {
          delete updatedTasks[date];
        }
      }
      return updatedTasks;
    });

    toast({
      title: "משימה נמחקה",
      description: "המשימה נמחקה בהצלחה",
    });
  };

  const editTask = (taskId: string, newTitle: string, newDuration: number) => {
    setTasksByDate((prev) => {
      const updatedTasks = { ...prev };
      for (const date in updatedTasks) {
        const taskIndex = updatedTasks[date].findIndex((t) => t.id === taskId);
        if (taskIndex !== -1) {
          updatedTasks[date] = [...updatedTasks[date]];
          updatedTasks[date][taskIndex] = {
            ...updatedTasks[date][taskIndex],
            title: newTitle,
            duration: newDuration,
          };
          break;
        }
      }
      return updatedTasks;
    });

    toast({
      title: "משימה עודכנה",
      description: "המשימה עודכנה בהצלחה",
    });
  };

  const toggleTask = (taskId: string) => {
    setTasksByDate((prev) => {
      const updatedTasks = { ...prev };
      for (const date in updatedTasks) {
        const taskIndex = updatedTasks[date].findIndex((t) => t.id === taskId);
        if (taskIndex !== -1) {
          updatedTasks[date] = [...updatedTasks[date]];
          const task = updatedTasks[date][taskIndex];
          updatedTasks[date][taskIndex] = {
            ...task,
            completed: !task.completed,
            startTime: !task.startTime && !task.completed ? new Date().toISOString() : task.startTime,
          };
          break;
        }
      }
      return updatedTasks;
    });
  };

  const handleTaskComplete = (taskId: string) => {
    setTasksByDate((prev) => {
      const updatedTasks = { ...prev };
      for (const date in updatedTasks) {
        const taskIndex = updatedTasks[date].findIndex((t) => t.id === taskId);
        if (taskIndex !== -1) {
          updatedTasks[date] = [...updatedTasks[date]];
          updatedTasks[date][taskIndex] = {
            ...updatedTasks[date][taskIndex],
            completed: true,
          };
          break;
        }
      }
      return updatedTasks;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-right bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
          מעקב משימות
        </h1>
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