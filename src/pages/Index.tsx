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
import { useQuery } from "@tanstack/react-query";
import { useWorkerState } from "@/hooks/useWorkerState";
import { useTaskMutations } from "@/hooks/useTaskMutations";

const Index = () => {
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'duration'>('date');
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
            onAddTask={(title, duration, priority) => 
              addTaskMutation.mutate({ title, duration, priority, worker: currentWorker })}
            tasksByDate={tasksByDate}
            isLoading={isLoading}
            onToggleTask={(taskId) => toggleTaskMutation.mutate({ taskId, worker: currentWorker })}
            onTaskComplete={(taskId) => toggleTaskMutation.mutate({ taskId, worker: currentWorker })}
            onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
            onEditTask={(taskId, newTitle, newDuration, newPriority) => 
              editTaskMutation.mutate({ taskId, newTitle, newDuration, newPriority, worker: currentWorker })}
          />
          
          <TaskStats tasksByDate={tasksByDate} />
        </div>
        <Toaster />
      </div>
    </ErrorBoundary>
  );
};

export default Index;