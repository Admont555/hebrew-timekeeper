
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskPriority } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

export const useTaskMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addTaskMutation = useMutation({
    mutationFn: async ({ title, duration, priority, worker, _file }: { 
      title?: string; 
      duration?: number; 
      priority?: TaskPriority;
      worker?: string;
      _file?: File;
    }) => {
      try {
        let newTaskId;
        
        if (title || duration || priority || worker) {
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
            progress: 0, // Initialize with 0% progress
            dependencies: [], // Initialize with empty dependencies array
          };

          const { data: taskData, error } = await supabase
            .from("tasks")
            .insert(newTask)
            .select()
            .single();

          if (error) throw error;
          newTaskId = taskData.id;
        }

        if (_file) {
          try {
            const timestamp = new Date().getTime();
            const fileExt = _file.name.split('.').pop();
            const fileName = `${newTaskId || timestamp}/${timestamp}.${fileExt}`;

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

            const { data: { publicUrl } } = supabase.storage
              .from('table-attachments')
              .getPublicUrl(fileName);

            const { error: updateError } = await supabase
              .from('tasks')
              .update({
                attachments: [{
                  name: _file.name,
                  url: publicUrl,
                  type: _file.type,
                  size: _file.size,
                }]
              })
              .eq('id', newTaskId);

            if (updateError) throw updateError;
          } catch (error) {
            console.error('File upload error:', error);
            throw error;
          }
        }
      } catch (error: any) {
        console.error('Task creation error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "משימה נוספה",
        description: "המשימה החדשה נוספה בהצלחה",
      });
    },
    onError: (error: any) => {
      console.error('Error in addTaskMutation:', error);
      toast({
        title: "שגיאה בהוספת משימה",
        description: error.message || "אירעה שגיאה בלתי צפויה",
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
    mutationFn: async ({ taskId, newTitle, newDuration, newPriority, worker, _file, attachments, progress, dependencies }: { 
      taskId: string; 
      newTitle?: string; 
      newDuration?: number; 
      newPriority?: TaskPriority;
      worker?: string;
      _file?: File;
      attachments?: Array<{
        name: string;
        url: string;
        type: string;
        size: number;
      }>;
      progress?: number;
      dependencies?: string[];
    }) => {
      if (_file) {
        try {
          const timestamp = new Date().getTime();
          const fileExt = _file.name.split('.').pop();
          const fileName = `${taskId}/${timestamp}.${fileExt}`;

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

          const { data: { publicUrl } } = supabase.storage
            .from('table-attachments')
            .getPublicUrl(fileName);

          const { data: currentTask, error: fetchError } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', taskId)
            .single();

          if (fetchError) throw fetchError;

          const existingAttachments = Array.isArray(currentTask?.attachments) ? currentTask.attachments : [];

          const { error: updateError } = await supabase
            .from('tasks')
            .update({
              attachments: [
                ...existingAttachments,
                {
                  name: _file.name,
                  url: publicUrl,
                  type: _file.type,
                  size: _file.size,
                }
              ]
            })
            .eq('id', taskId);

          if (updateError) throw updateError;
        } catch (error) {
          console.error('File upload error:', error);
          throw error;
        }
      } else {
        // Use an object to collect all the updates
        const updates: Record<string, any> = {};
        
        if (attachments !== undefined) {
          updates.attachments = attachments;
        }
        
        if (newTitle !== undefined) {
          updates.title = newTitle;
        }
        
        if (newDuration !== undefined) {
          updates.duration = newDuration;
        }
        
        if (newPriority !== undefined) {
          updates.priority = newPriority;
        }
        
        if (progress !== undefined) {
          updates.progress = progress;
        }
        
        if (dependencies !== undefined) {
          updates.dependencies = dependencies;
        }
        
        if (Object.keys(updates).length > 0) {
          const { error } = await supabase
            .from("tasks")
            .update(updates)
            .eq("id", taskId);
  
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "עודכן בהצלחה",
        description: "השינויים נשמרו בהצלחה",
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
      
      // When completing a task, set progress to 100%
      // Check if progress column exists before trying to access it
      let progressValue = tasks.completed ? 0 : 100;
      if (tasks.hasOwnProperty('progress')) {
        progressValue = !tasks.completed ? 100 : (tasks.progress as number || 0);
      }

      const updates: Record<string, any> = {
        completed: !tasks.completed,
        start_time: !tasks.start_time && !tasks.completed ? new Date().toISOString() : tasks.start_time,
      };
      
      // Only add progress to updates if the column exists in the table
      if (tasks.hasOwnProperty('progress')) {
        updates.progress = progressValue;
      }

      const { error } = await supabase
        .from("tasks")
        .update(updates)
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

  const updateTaskProgressMutation = useMutation({
    mutationFn: async ({ taskId, progress }: { taskId: string; progress: number }) => {
      // Ensure progress is between 0 and 100
      const normalizedProgress = Math.max(0, Math.min(100, progress));
      
      // If progress is 100%, also mark the task as completed
      const updates: Record<string, any> = {}; 
      
      // Add progress to updates if the column exists
      updates.progress = normalizedProgress;
      
      if (normalizedProgress === 100) {
        updates.completed = true;
      }
      
      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "התקדמות עודכנה",
        description: "התקדמות המשימה עודכנה בהצלחה",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בעדכון התקדמות",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTaskDependenciesMutation = useMutation({
    mutationFn: async ({ taskId, dependencies }: { taskId: string; dependencies: string[] }) => {
      // Create a safe update object that only includes the dependencies
      const updates: Record<string, any> = {
        dependencies
      };
      
      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "תלויות עודכנו",
        description: "תלויות המשימה עודכנו בהצלחה",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בעדכון תלויות",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reorderTasksMutation = useMutation({
    mutationFn: async ({ tasks }: { tasks: Task[] }) => {
      // In a real implementation, you might want to update task positions in the database
      // For now, we'll just invalidate the cache since we're managing order in the client
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בארגון משימות",
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
    updateTaskProgressMutation,
    updateTaskDependenciesMutation,
    reorderTasksMutation,
  };
};
