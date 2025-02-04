import { TasksByDate, Task, TaskPriority } from "@/types/task";
import TaskListContent from "./TaskListContent";
import { useEffect, useState } from "react";

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
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  useEffect(() => {
    // Find active task
    Object.values(tasksByDate).forEach(tasks => {
      tasks.forEach(task => {
        if (task.start_time && !task.completed) {
          setActiveTaskId(task.id);
        }
      });
    });
  }, [tasksByDate]);

  return (
    <TaskListContent
      tasksByDate={tasksByDate}
      isLoading={isLoading}
      onToggleTask={onToggleTask}
      onTaskComplete={onTaskComplete}
      onDeleteTask={onDeleteTask}
      onEditTask={onEditTask}
      activeTaskId={activeTaskId}
    />
  );
};

export default TaskListContainer;