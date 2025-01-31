import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import RandomQuote from "@/components/RandomQuote";
import { TasksByDate, TaskPriority } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ErrorBoundary from "@/components/ErrorBoundary";
import TaskStats from "@/components/task/TaskStats";
import TaskAnalytics from "@/components/task/TaskAnalytics";
import { useQuery } from "@tanstack/react-query";
import { useWorkerState } from "@/hooks/useWorkerState";
import { useTaskMutations } from "@/hooks/useTaskMutations";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import DateRangeSelector from "@/components/task/DateRangeSelector";
import { NavMenu } from "@/components/NavMenu";

const Index = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const {
    currentWorker,
    setCurrentWorker,
    workerNames,
  } = useWorkerState();

  // Set the current worker based on the URL parameter
  if (currentWorker !== workerId && workerId) {
    setCurrentWorker(workerId);
  }

  const {
    addTaskMutation,
    deleteTaskMutation,
    editTaskMutation,
    toggleTaskMutation,
  } = useTaskMutations();

  // Query to get the team member's name
  const { data: teamMember } = useQuery({
    queryKey: ['team-member', workerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('worker_id', workerId)
        .single();

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
        .eq('worker', workerId)
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
    toggleTaskMutation.mutate({ taskId, worker: workerId || '' });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
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
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              חזרה לצוות
            </Button>
            <h1 className="text-2xl font-bold">{teamMember?.name || 'Loading...'}</h1>
          </div>

          <Header />
          
          <div className="mb-6 max-w-2xl mx-auto">
            <RandomQuote />
          </div>

          <DateRangeSelector date={selectedDate} onDateChange={setSelectedDate} />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-xl shadow-lg p-4 mb-6 hover:shadow-xl transition-shadow duration-300"
          >
            <TaskForm onAddTask={(title, duration, priority) => 
              addTaskMutation.mutate({ title, duration, priority, worker: workerId })} 
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <TaskList 
              tasks={tasksByDate}
              isLoading={isLoading}
              onToggleTask={(taskId) => toggleTaskMutation.mutate({ taskId, worker: workerId })}
              onTaskComplete={handleTaskComplete}
              onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
              onEditTask={(taskId, newTitle, newDuration, newPriority) => 
                editTaskMutation.mutate({ taskId, newTitle, newDuration, newPriority, worker: workerId })}
            />
          </motion.div>
          
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