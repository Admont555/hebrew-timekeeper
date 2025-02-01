import { TasksByDate, Task, TaskPriority } from "@/types/task";
import TaskList from "@/components/TaskList";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface TaskContainerProps {
  tasksByDate: TasksByDate;
  isLoading: boolean;
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newTitle: string, newDuration: number, newPriority: TaskPriority) => void;
}

const TaskContainer = ({
  tasksByDate,
  isLoading,
  onToggleTask,
  onTaskComplete,
  onDeleteTask,
  onEditTask,
}: TaskContainerProps) => {
  const { workerId } = useParams();

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

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-purple-200 dark:border-purple-800">
            <AvatarImage src={teamMember?.avatar_url} alt={teamMember?.name} />
            <AvatarFallback>
              <User className="h-6 w-6 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {teamMember?.name || 'Team Member'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {workerId}
            </p>
          </div>
        </div>
      </div>
      <TaskList
        tasks={tasksByDate}
        isLoading={isLoading}
        onToggleTask={onToggleTask}
        onTaskComplete={onTaskComplete}
        onDeleteTask={onDeleteTask}
        onEditTask={onEditTask}
      />
    </div>
  );
};

export default TaskContainer;