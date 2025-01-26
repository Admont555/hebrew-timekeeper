import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, TasksByDate, TaskPriority } from "@/types/task";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import TaskListHeader from "./TaskListHeader";
import TaskListContent from "./TaskListContent";
import { useTaskSorting } from "@/hooks/useTaskSorting";
import { useTaskSearch } from "@/hooks/useTaskSearch";

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
  const { searchQuery, setSearchQuery, filteredTasks } = useTaskSearch(sortedTasks);

  return (
    <ScrollArea className="h-[600px] rounded-md border p-4">
      <TaskListHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <TaskListContent
        tasksByDate={filteredTasks}
        isLoading={isLoading}
        onToggleTask={onToggleTask}
        onTaskComplete={onTaskComplete}
        onDeleteTask={onDeleteTask}
        onEditTask={onEditTask}
      />
    </ScrollArea>
  );
};

export default TaskListContainer;