import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TaskListHeader from "./TaskListHeader";
import TaskListContent from "./TaskListContent";
import { useTaskSorting } from "@/hooks/useTaskSorting";
import { useTaskSearch } from "@/hooks/useTaskSearch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface TaskListContainerProps {
  workerId: string;
  selectedDate: Date;
  showArchived: boolean;
}

const TaskListContainer = ({
  workerId,
  selectedDate,
  showArchived,
}: TaskListContainerProps) => {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', workerId, selectedDate, showArchived],
    queryFn: async () => {
      const query = supabase
        .from('tasks')
        .select('*')
        .eq('worker', workerId)
        .eq('date', selectedDate.toISOString().split('T')[0]);

      if (!showArchived) {
        query.is('archived_at', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

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

  const tasksByDate = {
    [selectedDate.toISOString().split('T')[0]]: tasks
  };

  const { sortedTasks, sortBy, setSortBy } = useTaskSorting(tasksByDate);
  const { searchTerm, setSearchTerm, filteredTasks } = useTaskSearch(sortedTasks);

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
        />
      </ScrollArea>
    </div>
  );
};

export default TaskListContainer;