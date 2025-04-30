
import { Task, TasksByDate, TaskPriority } from "@/types/task";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { Loader2, MoveVertical, Trash2 } from "lucide-react";
import TaskItem from "../TaskItem";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface TaskListContentProps {
  tasksByDate: TasksByDate;
  isLoading: boolean;
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteAllTasksForDate?: (date: string) => void;
  onReorderTasks?: (date: string, tasks: Task[]) => void;
  onUpdateTaskDependencies?: (taskId: string, dependencies: string[]) => void;
  onUpdateTaskProgress?: (taskId: string, progress: number) => void;
}

const TaskListContent = ({
  tasksByDate,
  isLoading,
  onToggleTask,
  onTaskComplete,
  onDeleteTask,
  onEditTask,
  onDeleteAllTasksForDate,
  onReorderTasks,
  onUpdateTaskDependencies,
  onUpdateTaskProgress,
}: TaskListContentProps) => {
  const [reorderedTasks, setReorderedTasks] = useState<TasksByDate>(tasksByDate);
  const isMobile = useIsMobile();
  const [activeDragDate, setActiveDragDate] = useState<string | null>(null);
  const { toast } = useToast();

  // Collect all tasks in a flat array for dependency lookups
  const allTasks: Task[] = Object.values(tasksByDate).flat();

  useEffect(() => {
    setReorderedTasks(tasksByDate);
  }, [tasksByDate]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "EEEE, d בMMMM yyyy", { locale: he });
  };

  const handleReorder = (date: string, newOrder: Task[]) => {
    setReorderedTasks(prev => ({
      ...prev,
      [date]: newOrder
    }));

    // Only call the parent handler if this feature is enabled
    if (onReorderTasks) {
      onReorderTasks(date, newOrder);
    }
  };

  // Handle drag start to highlight the active date section
  const handleDragStart = (date: string) => {
    setActiveDragDate(date);
  };

  // Handle drag end to clear highlighting and show toast notification
  const handleDragEnd = () => {
    setActiveDragDate(null);
    toast({
      title: "סדר המשימות עודכן",
      description: "סדר המשימות החדש נשמר בהצלחה",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (Object.keys(reorderedTasks).length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16 text-gray-500 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg"
      >
        <p className="text-lg font-medium">לא נמצאו משימות</p>
        <p className="text-sm mt-2">התחל להוסיף משימות חדשות!</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(reorderedTasks).map(([date, tasks]) => (
        <motion.div
          key={date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: activeDragDate === date ? 1.01 : 1
          }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className={cn(
            "space-y-4 rounded-lg",
            activeDragDate === date ? "bg-purple-50/50 dark:bg-purple-900/10 shadow-lg" : ""
          )}
        >
          <div className="sticky top-0 bg-purple-50 dark:bg-gray-800 border-b border-purple-100 dark:border-gray-700 shadow-sm z-10 py-3 rounded-t-lg px-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-800 to-indigo-700 dark:from-purple-300 dark:to-indigo-400 bg-clip-text text-transparent">
              {formatDate(date)}
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground">
                {tasks.length > 1 && !isMobile && (
                  <div className="flex items-center gap-1">
                    <MoveVertical className="h-3 w-3" />
                    <span>גרור כדי לסדר מחדש</span>
                  </div>
                )}
              </div>
              
              {tasks.length > 0 && onDeleteAllTasksForDate && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[44px] min-w-[44px]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>מחיקת כל המשימות</AlertDialogTitle>
                      <AlertDialogDescription>
                        האם אתה בטוח שברצונך למחוק את כל המשימות מתאריך {formatDate(date)}?
                        <br />
                        פעולה זו אינה הפיכה.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="min-h-[44px]">ביטול</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDeleteAllTasksForDate(date)}
                        className="bg-red-500 hover:bg-red-600 text-white min-h-[44px]"
                      >
                        מחק הכל
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          <AnimatePresence mode="popLayout">
            <div className="space-y-3 px-1">
              {tasks.length > 0 && (
                isMobile ? (
                  // On mobile, just render the tasks without Reorder to improve compatibility
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id}>
                        <TaskItem
                          key={task.id}
                          task={task}
                          allTasks={allTasks}
                          onToggleTask={onToggleTask}
                          onTaskComplete={onTaskComplete}
                          onDeleteTask={onDeleteTask}
                          onEdit={onEditTask}
                          onUpdateDependencies={onUpdateTaskDependencies}
                          onUpdateProgress={onUpdateTaskProgress}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  // On desktop, use Reorder for drag and drop functionality
                  <Reorder.Group 
                    axis="y" 
                    values={tasks} 
                    onReorder={(newOrder) => handleReorder(date, newOrder)}
                    className="space-y-3"
                    onDragStart={() => handleDragStart(date)}
                    onDragEnd={handleDragEnd}
                  >
                    {tasks.map((task) => (
                      <Reorder.Item
                        key={task.id}
                        value={task}
                        className="touch-none"
                        layoutId={task.id}
                      >
                        <TaskItem
                          key={task.id}
                          task={task}
                          allTasks={allTasks}
                          onToggleTask={onToggleTask}
                          onTaskComplete={onTaskComplete}
                          onDeleteTask={onDeleteTask}
                          onEdit={onEditTask}
                          onUpdateDependencies={onUpdateTaskDependencies}
                          onUpdateProgress={onUpdateTaskProgress}
                        />
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                )
              )}
            </div>
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default TaskListContent;
