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
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-right">מעקב משימות</h1>
      <TaskForm onAddTask={addTask} />
      <TaskList 
        tasks={tasksByDate} 
        onToggleTask={toggleTask}
        onTaskComplete={handleTaskComplete}
        onDeleteTask={deleteTask}
        onEditTask={editTask}
      />
    </div>
  );
};

export default Index;