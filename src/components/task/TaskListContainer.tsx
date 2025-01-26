import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, TasksByDate } from "@/types/task";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import TaskListHeader from "./TaskListHeader";
import TaskListContent from "./TaskListContent";
import { useTaskSorting } from "@/hooks/useTaskSorting";
import { useTaskSearch } from "@/hooks/useTaskSearch";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface TaskListContainerProps {
  tasks: TasksByDate;
  isLoading: boolean;
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newTitle: string, newDuration: number, newPriority: TaskPriority) => void;
}

const TaskListContainer = ({
  tasks,
  isLoading,
  onToggleTask,
  onTaskComplete,
  onDeleteTask,
  onEditTask,
}: TaskListContainerProps) => {
  const { sortedDates, sortTasks } = useTaskSorting(tasks);
  const { searchTerm, setSearchTerm, filteredTasks } = useTaskSearch(tasks);
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+f': () => document.getElementById('task-search')?.focus(),
    'esc': () => setSearchTerm(''),
  });

  return (
    <ScrollArea className="flex-1 w-full rounded-lg p-6">
      <TaskListHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <TaskListContent
        sortedDates={sortedDates}
        tasks={filteredTasks}
        sortTasks={sortTasks}
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