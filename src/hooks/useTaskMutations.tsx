import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskPriority } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

export const useTaskMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addTaskMutation = useMutation({
    mutationFn: async ({ title, duration, priority, worker }: { 
      title: string; 
      duration: number; 
      priority: TaskPriority;
      worker: string;
    }) => {
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      
      const newTask = {
        title,
        timestamp: now.toISOString(),
        completed: false,
        date: dateStr,
        duration,
        priority,
        worker,
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
    mutationFn: async ({ taskId, newTitle, newDuration, newPriority, worker }: { 
      taskId: string; 
      newTitle: string; 
      newDuration: number; 
      newPriority: TaskPriority;
      worker: string;
    }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ 
          title: newTitle, 
          duration: newDuration,
          priority: newPriority
        })
        .eq("id", taskId)
        .eq('worker', worker);

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
    mutationFn: async ({ taskId, worker }: { taskId: string; worker: string }) => {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();
      
      if (!tasks) throw new Error("Task not found");

      const { error } = await supabase
        .from("tasks")
        .update({ 
          completed: !tasks.completed,
          start_time: !tasks.start_time && !tasks.completed ? new Date().toISOString() : tasks.start_time
        })
        .eq("id", taskId)
        .eq('worker', worker);

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

  return {
    addTaskMutation,
    deleteTaskMutation,
    editTaskMutation,
    toggleTaskMutation,
  };
};