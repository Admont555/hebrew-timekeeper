
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, TasksByDate, TaskPriority } from "@/types/task";
import { useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import TaskListContent from "./task/TaskListContent";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTaskShortcuts } from "@/hooks/useTaskShortcuts";

interface TaskListProps {
  tasks: TasksByDate;
  isLoading: boolean;
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newTitle: string, newDuration: number, newPriority: TaskPriority, categoryId?: string) => void;
  onDeleteAllTasksForDate?: (date: string) => void;
  onReorderTasks?: (date: string, tasks: Task[]) => void;
  onUpdateTaskProgress?: (taskId: string, progress: number) => void;
}

const TaskList = ({
  tasks,
  isLoading,
  onToggleTask,
  onTaskComplete,
  onDeleteTask,
  onEditTask,
  onDeleteAllTasksForDate,
  onReorderTasks,
  onUpdateTaskProgress,
}: TaskListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleEditTask = (task: Task) => {
    onEditTask(task.id, task.title, task.duration || 0, task.priority, task.category_id);
  };

  const { showKeyboardShortcuts } = useTaskShortcuts({
    onToggleFilterCompleted: () => {
      toast({ title: "קיצור מקלדת הופעל", description: "סינון משימות לפי סטטוס" });
    },
    onSearch: () => {
      const searchInput = document.querySelector('input[type="search"]');
      if (searchInput) (searchInput as HTMLInputElement).focus();
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      toast({ title: "קיצורי מקלדת זמינים", description: "לחץ F1 להצגת רשימת הקיצורים", duration: 5000 });
    }, 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const content = (
    <TaskListContent
      tasksByDate={tasks}
      isLoading={isLoading}
      onToggleTask={onToggleTask}
      onTaskComplete={onTaskComplete}
      onDeleteTask={onDeleteTask}
      onEditTask={handleEditTask}
      onDeleteAllTasksForDate={onDeleteAllTasksForDate}
      onReorderTasks={onReorderTasks}
      onUpdateTaskProgress={onUpdateTaskProgress}
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full rounded-xl overflow-hidden"
      dir="rtl"
    >
      {isMobile ? (
        <div 
          className="flex-1 w-full rounded-xl p-3 sm:p-4 md:p-6 h-[60vh] md:h-[65vh] overflow-y-auto"
          style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          {content}
        </div>
      ) : (
        <ScrollArea ref={scrollAreaRef} className="flex-1 w-full rounded-xl p-3 sm:p-4 md:p-6 h-[60vh] md:h-[65vh]">
          {content}
        </ScrollArea>
      )}
    </motion.div>
  );
};

export default TaskList;
