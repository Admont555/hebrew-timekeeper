import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import RandomQuote from "@/components/RandomQuote";
import { TasksByDate, TaskPriority } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ErrorBoundary from "@/components/ErrorBoundary";
import TaskHeader from "@/components/task/TaskHeader";
import TaskStats from "@/components/task/TaskStats";
import TaskAnalytics from "@/components/task/TaskAnalytics";
import TaskConfetti from "@/components/task/TaskConfetti";
import { useQuery } from "@tanstack/react-query";
import { useWorkerState } from "@/hooks/useWorkerState";
import { useTaskMutations } from "@/hooks/useTaskMutations";
import { motion } from "framer-motion";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  
  const {
    currentWorker,
    setCurrentWorker,
    workerNames,
    handleWorkerNameChange,
  } = useWorkerState();

  const {
    addTaskMutation,
    deleteTaskMutation,
    editTaskMutation,
    toggleTaskMutation,
  } = useTaskMutations();

  const { data: tasksByDate = {}, isLoading } = useQuery({
    queryKey: ['tasks', currentWorker, selectedDate],
    queryFn: async () => {
      let query = supabase
        .from("tasks")
        .select("*")
        .eq('worker', currentWorker)
        .order("timestamp", { ascending: false });

      if (selectedDate) {
        query = query.eq('date', selectedDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

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

  const handleTaskComplete = (taskId: string) => {
    toggleTaskMutation.mutate({ taskId, worker: currentWorker });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <ErrorBoundary>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="scroll-container safe-area-top safe-area-bottom min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300"
      >
        <TaskConfetti show={showConfetti} />
        
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
            onAddTask={(title, duration, priority) => 
              addTaskMutation.mutate({ title, duration, priority, worker: currentWorker })}
            tasksByDate={tasksByDate}
            isLoading={isLoading}
            onToggleTask={(taskId) => toggleTaskMutation.mutate({ taskId, worker: currentWorker })}
            onTaskComplete={handleTaskComplete}
            onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
            onEditTask={(taskId, newTitle, newDuration, newPriority) => 
              editTaskMutation.mutate({ taskId, newTitle, newDuration, newPriority, worker: currentWorker })}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          
          <div className="grid gap-6 mt-6">
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