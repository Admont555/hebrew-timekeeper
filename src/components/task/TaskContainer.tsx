import { TasksByDate, Task, TaskPriority } from "@/types/task";
import TaskList from "@/components/TaskList";

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
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg">
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