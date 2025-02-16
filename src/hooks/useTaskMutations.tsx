
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskPriority } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

interface TableRowData {
  [key: string]: any;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

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
    mutationFn: async ({ taskId, newTitle, newDuration, newPriority, worker, _file }: { 
      taskId: string; 
      newTitle?: string; 
      newDuration?: number; 
      newPriority?: TaskPriority;
      worker?: string;
      _file?: File;
    }) => {
      if (_file) {
        try {
          const timestamp = new Date().getTime();
          const fileExt = _file.name.split('.').pop();
          const fileName = `${taskId}/${timestamp}.${fileExt}`;

          // First, upload the file
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('table-attachments')
            .upload(fileName, _file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('Failed to upload file');
          }

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('table-attachments')
            .getPublicUrl(fileName);

          // Get current row data
          const { data: currentRow, error: fetchError } = await supabase
            .from('table_rows')
            .select('data')
            .eq('id', taskId)
            .single();

          if (fetchError) {
            console.error('Fetch error:', fetchError);
            throw fetchError;
          }

          // Prepare the data update
          const existingData = (currentRow?.data as Record<string, any>) || {};
          const existingAttachments = Array.isArray(existingData.attachments) ? existingData.attachments : [];

          // Update the row with new attachment
          const { error: updateError } = await supabase
            .from('table_rows')
            .update({
              data: {
                ...existingData,
                attachments: [
                  ...existingAttachments,
                  {
                    name: _file.name,
                    url: publicUrl,
                    type: _file.type,
                    size: _file.size,
                  }
                ]
              }
            })
            .eq('id', taskId);

          if (updateError) {
            console.error('Update error:', updateError);
            throw updateError;
          }
        } catch (error) {
          console.error('File upload error:', error);
          throw error;
        }
      } else if (newTitle || newDuration || newPriority) {
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
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['table-rows'] });
      toast({
        title: "עודכן בהצלחה",
        description: "הקובץ הועלה בהצלחה",
      });
    },
    onError: (error) => {
      console.error('Error in editTaskMutation:', error);
      toast({
        title: "שגיאה בעדכון",
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
