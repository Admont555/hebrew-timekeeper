
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, TasksByDate, TaskPriority } from "@/types/task";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import TaskListContent from "./task/TaskListContent";

interface TaskListProps {
  tasks: TasksByDate;
  isLoading: boolean;
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newTitle: string, newDuration: number, newPriority: TaskPriority) => void;
  onDeleteAllTasksForDate?: (date: string) => void;
}

const TaskList = ({
  tasks,
  isLoading,
  onToggleTask,
  onTaskComplete,
  onDeleteTask,
  onEditTask,
  onDeleteAllTasksForDate,
}: TaskListProps) => {
  const activeTaskRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Pass the onEditTask function directly to TaskListContent
  const handleEditTask = (task: Task) => {
    onEditTask(task.id, task.title, task.duration || 0, task.priority);
  };

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 w-full rounded-lg p-6">
      <TaskListContent
        tasksByDate={tasks}
        isLoading={isLoading}
        onToggleTask={onToggleTask}
        onTaskComplete={onTaskComplete}
        onDeleteTask={onDeleteTask}
        onEditTask={handleEditTask}
        onDeleteAllTasksForDate={onDeleteAllTasksForDate}
      />
    </ScrollArea>
  );
};

export default TaskList;
