
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import { useTaskMutations } from "@/hooks/useTaskMutations";
import { useToast } from "@/hooks/use-toast";
import { TasksByDate, Task } from "@/types/task";

const ProjectTasks = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { addTaskMutation, deleteTaskMutation, editTaskMutation, toggleTaskMutation } = useTaskMutations();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        throw error;
      }

      return data;
    },
  });

  const { data: tasks, isLoading: tasksLoading, refetch } = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Error fetching project tasks:", error);
        throw error;
      }

      // Transform the data to match our Task interface
      const transformedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        timestamp: task.timestamp,
        completed: task.completed,
        date: task.date,
        duration: task.duration || 0,
        startTime: task.start_time,
        comments: task.comments || [],
        attachments: task.attachments || [],
        priority: task.priority as "low" | "normal" | "high",
        worker: task.worker,
        assigned_to: task.assigned_to || [],
        progress: task.progress || 0,
        dependencies: task.dependencies || [],
        archived_at: task.archived_at,
        archived_by: task.archived_by,
        category_id: task.category_id,
        due_date: task.due_date,
        notification_time: task.notification_time,
        offline_id: task.offline_id,
        order_index: task.order_index,
        reminder_time: task.reminder_time,
        sync_status: task.sync_status,
        tags: task.tags || [],
        voice_note: task.voice_note,
        project_id: task.project_id,
      }));

      return transformedTasks;
    },
  });

  const handleTaskCreated = (title: string, duration: number, priority: "low" | "normal" | "high") => {
    addTaskMutation.mutate({ 
      title, 
      duration, 
      priority, 
      worker: "worker1",
      projectId 
    });
    setIsCreateDialogOpen(false);
    toast({
      title: "משימה נוספה לפרויקט",
      description: "המשימה החדשה נוספה בהצלחה לפרויקט",
    });
  };

  const handleToggleTask = (taskId: string) => {
    toggleTaskMutation.mutate({ taskId, worker: "worker1" });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const handleEditTask = (taskId: string, newTitle: string, newDuration: number, newPriority: any) => {
    editTaskMutation.mutate({ 
      taskId, 
      newTitle, 
      newDuration, 
      newPriority 
    });
  };

  if (projectLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            פרויקט לא נמצא
          </h1>
          <Button onClick={() => navigate("/projects")}>
            <ArrowRight className="h-4 w-4 ml-2" />
            חזור לרשימת הפרויקטים
          </Button>
        </div>
      </div>
    );
  }

  // Group tasks by date for TaskList component
  const tasksByDate: TasksByDate = {};
  if (tasks) {
    tasks.forEach(task => {
      const dateKey = task.date || new Date().toISOString().split('T')[0];
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate("/projects")}>
          <ArrowRight className="h-4 w-4 ml-2" />
          חזור לפרויקטים
        </Button>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              משימה חדשה
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>יצירת משימה חדשה לפרויקט</DialogTitle>
            </DialogHeader>
            <TaskForm 
              onAddTask={handleTaskCreated}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-right">
            משימות פרויקט: {project.title}
          </CardTitle>
          {project.description && (
            <p className="text-gray-600 dark:text-gray-400 text-right">
              {project.description}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            סה"כ משימות: {tasks?.length || 0}
          </div>
        </CardContent>
      </Card>

      <TaskList
        tasks={tasksByDate}
        isLoading={tasksLoading}
        onToggleTask={handleToggleTask}
        onTaskComplete={handleToggleTask}
        onDeleteTask={handleDeleteTask}
        onEditTask={handleEditTask}
      />
    </div>
  );
};

export default ProjectTasks;
