import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskPriority } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { useOfflineSync } from "./useOfflineSync";

export const useTaskMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isOnline, saveTask } = useOfflineSync();

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

      if (!isOnline) {
        return saveTask(newTask);
      }

      const { error } = await supabase
        .from("tasks")
        .insert(newTask);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "משימה נוספה",
        description: isOnline ? "המשימה החדשה נוספה בהצלחה" : "המשימה נשמרה במצב לא מקוון",
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
      if (!isOnline) {
        throw new Error("לא ניתן למחוק משימות במצב לא מקוון");
      }

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
      if (!isOnline) {
        throw new Error("לא ניתן לערוך משימות במצב לא מקוון");
      }

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
      if (!isOnline) {
        throw new Error("לא ניתן לשנות סטטוס משימה במצב לא מקוון");
      }

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