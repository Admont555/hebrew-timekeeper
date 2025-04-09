
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, TasksByDate, TaskPriority } from "@/types/task";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import TaskListContent from "./task/TaskListContent";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  // Pass the onEditTask function directly to TaskListContent
  const handleEditTask = (task: Task) => {
    onEditTask(task.id, task.title, task.duration || 0, task.priority);
  };

  // For mobile browsers, use a regular div with overflow instead of ScrollArea
  // to avoid compatibility issues with some mobile browsers
  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full rounded-lg overflow-hidden"
      >
        <div 
          className="flex-1 w-full rounded-lg p-4 md:p-6 h-[60vh] md:h-[65vh] overflow-y-auto"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}
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
        </div>
      </motion.div>
    );
  }

  // Use ScrollArea for desktop browsers
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full rounded-lg overflow-hidden"
    >
      <ScrollArea 
        ref={scrollAreaRef} 
        className="flex-1 w-full rounded-lg p-4 md:p-6 h-[60vh] md:h-[65vh]"
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
