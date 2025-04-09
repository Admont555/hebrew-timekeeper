
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, TasksByDate, TaskPriority } from "@/types/task";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import TaskListContent from "./task/TaskListContent";
import { motion } from "framer-motion";

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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Pass the onEditTask function directly to TaskListContent
  const handleEditTask = (task: Task) => {
    onEditTask(task.id, task.title, task.duration || 0, task.priority);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full rounded-lg overflow-hidden"
    >
      <ScrollArea 
        ref={scrollAreaRef} 
        className="flex-1 w-full rounded-lg p-4 md:p-6 h-[65vh] md:h-[70vh] -webkit-overflow-scrolling-touch"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
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
    </motion.div>
  );
};

export default TaskList;
