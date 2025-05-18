
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, TasksByDate, TaskPriority } from "@/types/task";
import TaskListHeader from "./TaskListHeader";
import TaskListContent from "./TaskListContent";
import { useTaskSorting } from "@/hooks/useTaskSorting";
import { useTaskSearch } from "@/hooks/useTaskSearch";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useState } from "react";

interface TaskListContainerProps {
  tasksByDate: TasksByDate;
  isLoading: boolean;
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newTitle: string, newDuration: number, newPriority: TaskPriority) => void;
}

const TaskListContainer = ({
  tasksByDate,
  isLoading,
  onToggleTask,
  onTaskComplete,
  onDeleteTask,
  onEditTask,
}: TaskListContainerProps) => {
  const { sortedTasks, sortBy, setSortBy } = useTaskSorting(tasksByDate);
  const { searchTerm, setSearchTerm, filteredTasks } = useTaskSearch(sortedTasks);
  const { workerId } = useParams();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

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

  // This adapter function bridges the Task object from TaskListContent
  // to the separate parameters expected by the parent component
  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    onEditTask(task.id, task.title, task.duration || 0, task.priority);
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-purple-200 dark:border-purple-800">
            <AvatarImage src={teamMember?.avatar_url || ''} alt={teamMember?.name || 'Team Member'} />
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
      <ScrollArea className="h-[600px] p-4">
        <TaskListHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        <TaskListContent
          tasksByDate={filteredTasks}
          isLoading={isLoading}
          onToggleTask={onToggleTask}
          onTaskComplete={onTaskComplete}
          onDeleteTask={onDeleteTask}
          onEditTask={handleEditTask}
        />
      </ScrollArea>
    </div>
  );
};

export default TaskListContainer;
