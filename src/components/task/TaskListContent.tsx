
import { Task, TasksByDate, TaskPriority } from "@/types/task";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { Loader2, MoveVertical, Trash2 } from "lucide-react";
import TaskItem from "../TaskItem";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
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

interface TaskListContentProps {
  tasksByDate: TasksByDate;
  isLoading: boolean;
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteAllTasksForDate?: (date: string) => void;
}

const TaskListContent = ({
  tasksByDate,
  isLoading,
  onToggleTask,
  onTaskComplete,
  onDeleteTask,
  onEditTask,
  onDeleteAllTasksForDate,
}: TaskListContentProps) => {
  const [reorderedTasks, setReorderedTasks] = useState<TasksByDate>(tasksByDate);

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
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (Object.keys(reorderedTasks).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        לא נמצאו משימות
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(reorderedTasks).map(([date, tasks]) => (
        <motion.div
          key={date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-4"
        >
          <div className="sticky top-0 bg-purple-50/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-purple-100 dark:border-gray-700 shadow-sm z-10 py-3 flex justify-between items-center rounded-t-lg px-3">
            <h2 className="text-lg font-semibold text-purple-800 dark:text-purple-300">{formatDate(date)}</h2>
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground">
                {tasks.length > 1 && (
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
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>מחיקת כל המשימות</AlertDialogTitle>
                      <AlertDialogDescription>
                        האם אתה בטוח שברצונך למחוק את כל המשימות מתאריך {formatDate(date)}?
                        <br />
                        פעולה זו אינה הפיכה.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ביטול</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDeleteAllTasksForDate(date)}
                        className="bg-red-500 hover:bg-red-600"
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
            <div className="space-y-2">
              {tasks.length > 0 && (
                <Reorder.Group 
                  axis="y" 
                  values={tasks} 
                  onReorder={(newOrder) => handleReorder(date, newOrder)}
                  className="space-y-2"
                >
                  {tasks.map((task) => (
                    <Reorder.Item
                      key={task.id}
                      value={task}
                      className="cursor-move touch-manipulation"
                    >
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggleTask={onToggleTask}
                        onTaskComplete={onTaskComplete}
                        onDeleteTask={onDeleteTask}
                        onEdit={onEditTask}
                      />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}
            </div>
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default TaskListContent;
