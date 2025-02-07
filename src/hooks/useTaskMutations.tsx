
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskPriority } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

export const useTaskMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addTaskMutation = useMutation({
    mutationFn: async ({ 
      title, 
      duration, 
      priority, 
      worker,
      categoryId,
      assignedTo,
      dueDate,
      reminderTime,
      tags 
    }: { 
      title: string; 
      duration: number; 
      priority: TaskPriority;
      worker: string;
      categoryId?: string;
      assignedTo?: string[];
      dueDate?: string;
      reminderTime?: string;
      tags?: string[];
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
        category_id: categoryId,
        assigned_to: assignedTo,
        due_date: dueDate,
        reminder_time: reminderTime,
      };

      const { data: task, error } = await supabase
        .from("tasks")
        .insert(newTask)
        .select()
        .single();

      if (error) throw error;

      // If tags are provided, create task-tag relationships
      if (tags && tags.length > 0) {
        const taskTags = tags.map(tagId => ({
          task_id: task.id,
          tag_id: tagId
        }));

        const { error: tagError } = await supabase
          .from("task_tags")
          .insert(taskTags);

        if (tagError) throw tagError;
      }
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
    mutationFn: async ({ 
      taskId, 
      newTitle, 
      newDuration, 
      newPriority, 
      worker,
      categoryId,
      assignedTo,
      dueDate,
      reminderTime,
      tags 
    }: { 
      taskId: string; 
      newTitle: string; 
      newDuration: number; 
      newPriority: TaskPriority;
      worker: string;
      categoryId?: string;
      assignedTo?: string[];
      dueDate?: string;
      reminderTime?: string;
      tags?: string[];
    }) => {
      // Update task
      const { error } = await supabase
        .from("tasks")
        .update({ 
          title: newTitle, 
          duration: newDuration,
          priority: newPriority,
          category_id: categoryId,
          assigned_to: assignedTo,
          due_date: dueDate,
          reminder_time: reminderTime
        })
        .eq("id", taskId)
        .eq('worker', worker);

      if (error) throw error;

      // Update tags if provided
      if (tags) {
        // First remove existing tags
        const { error: deleteError } = await supabase
          .from("task_tags")
          .delete()
          .eq("task_id", taskId);

        if (deleteError) throw deleteError;

        // Then add new tags
        if (tags.length > 0) {
          const taskTags = tags.map(tagId => ({
            task_id: taskId,
            tag_id: tagId
          }));

          const { error: tagError } = await supabase
            .from("task_tags")
            .insert(taskTags);

          if (tagError) throw tagError;
        }
      }
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

  const reorderTaskMutation = useMutation({
    mutationFn: async ({ taskId, newIndex }: { taskId: string; newIndex: number }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ order_index: newIndex })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בסידור משימות",
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
    reorderTaskMutation,
  };
};
