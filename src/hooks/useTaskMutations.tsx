
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskPriority } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

export const useTaskMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addTaskMutation = useMutation({
    mutationFn: async ({ title, duration, priority, worker, _file, projectId }: { 
      title?: string; 
      duration?: number; 
      priority?: TaskPriority;
      worker?: string;
      _file?: File;
      projectId?: string;
    }) => {
      console.log('Adding task with params:', { title, duration, priority, worker, projectId });
      
      try {
        let newTaskId;
        
        if (title || duration || priority || worker || projectId) {
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
            project_id: projectId,
            progress: 0,
            dependencies: [],
          };

          console.log('Inserting task:', newTask);

          const { data: taskData, error } = await supabase
            .from("tasks")
            .insert(newTask)
            .select()
            .single();

          if (error) {
            console.error('Task insert error:', error);
            throw error;
          }
          
          console.log('Task inserted successfully:', taskData);
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
      console.log('Task added successfully, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
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
      console.log('Deleting task:', taskId);
      
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) {
        console.error('Delete task error:', error);
        throw error;
      }
      
      console.log('Task deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      toast({
        title: "משימה נמחקה",
        description: "המשימה נמחקה בהצלחה",
      });
    },
    onError: (error) => {
      console.error('Delete task mutation error:', error);
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
      console.log('Editing task:', { taskId, newTitle, newDuration, newPriority, progress, dependencies });
      
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
        
        console.log('Applying updates:', updates);
        
        if (Object.keys(updates).length > 0) {
          const { error } = await supabase
            .from("tasks")
            .update(updates)
            .eq("id", taskId);
  
          if (error) {
            console.error('Task update error:', error);
            throw error;
          }
          
          console.log('Task updated successfully');
        }
      }
    },
    onSuccess: () => {
      console.log('Edit task mutation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
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
      console.log('Toggling task:', { taskId, worker });
      
      const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();
      
      if (!tasks) {
        console.error('Task not found:', taskId);
        throw new Error("Task not found");
      }

      console.log('Current task state:', { completed: tasks.completed });

      const progressValue = tasks.completed ? 0 : 100;

      const updates: Record<string, any> = {
        completed: !tasks.completed,
        start_time: !tasks.start_time && !tasks.completed ? new Date().toISOString() : tasks.start_time,
        progress: progressValue,
      };
      
      console.log('Toggle updates:', updates);
      
      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId);

      if (error) {
        console.error('Toggle task error:', error);
        throw error;
      }
      
      console.log('Task toggled successfully');
    },
    onSuccess: () => {
      console.log('Toggle task mutation successful');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    },
    onError: (error) => {
      console.error('Toggle task mutation error:', error);
      toast({
        title: "שגיאה בעדכון משימה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTaskProgressMutation = useMutation({
    mutationFn: async ({ taskId, progress }: { taskId: string; progress: number }) => {
      console.log('Updating task progress:', { taskId, progress });
      
      const normalizedProgress = Math.max(0, Math.min(100, progress));
      
      const updates: Record<string, any> = {}; 
      
      updates.progress = normalizedProgress;
      
      if (normalizedProgress === 100) {
        updates.completed = true;
      }
      
      console.log('Progress updates:', updates);
      
      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId);

      if (error) {
        console.error('Update progress error:', error);
        throw error;
      }
      
      console.log('Progress updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      toast({
        title: "התקדמות עודכנה",
        description: "התקדמות המשימה עודכנה בהצלחה",
      });
    },
    onError: (error) => {
      console.error('Update progress mutation error:', error);
      toast({
        title: "שגיאה בעדכון התקדמות",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTaskDependenciesMutation = useMutation({
    mutationFn: async ({ taskId, dependencies }: { taskId: string; dependencies: string[] }) => {
      console.log('Updating task dependencies:', { taskId, dependencies });
      
      const updates: Record<string, any> = {
        dependencies
      };
      
      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId);

      if (error) {
        console.error('Update dependencies error:', error);
        throw error;
      }
      
      console.log('Dependencies updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      toast({
        title: "תלויות עודכנו",
        description: "תלויות המשימה עודכנו בהצלחה",
      });
    },
    onError: (error) => {
      console.error('Update dependencies mutation error:', error);
      toast({
        title: "שגיאה בעדכון תלויות",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reorderTasksMutation = useMutation({
    mutationFn: async ({ tasks }: { tasks: Task[] }) => {
      console.log('Reordering tasks:', tasks.length);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    },
    onError: (error) => {
      console.error('Reorder tasks mutation error:', error);
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
