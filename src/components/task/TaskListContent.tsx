import { Task, TasksByDate, TaskPriority } from "@/types/task";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { he } from "date-fns/locale";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { Loader2, MoveVertical, Trash2, Calendar, CheckCircle2, ListTodo, Sparkles } from "lucide-react";
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
  onUpdateTaskProject,
}: TaskListContentProps) => {
  const [reorderedTasks, setReorderedTasks] = useState<TasksByDate>(tasksByDate);
  const isMobile = useIsMobile();
  const [activeDragDate, setActiveDragDate] = useState<string | null>(null);
  const { toast } = useToast();

  const allTasks: Task[] = Object.values(tasksByDate).flat();

  useEffect(() => {
    setReorderedTasks(tasksByDate);
  }, [tasksByDate]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "EEEE, d בMMMM yyyy", { locale: he });
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return { label: "היום", color: "from-primary to-primary-glow", icon: Sparkles };
    if (isTomorrow(date)) return { label: "מחר", color: "from-task-normal to-amber-500", icon: Calendar };
    if (isYesterday(date)) return { label: "אתמול", color: "from-muted-foreground to-muted", icon: Calendar };
    return null;
  };

  const getCompletedCount = (tasks: Task[]) => {
    return tasks.filter(t => t.completed).length;
  };

  const handleReorder = (date: string, newOrder: Task[]) => {
    setReorderedTasks(prev => ({
      ...prev,
      [date]: newOrder
    }));

    if (onReorderTasks) {
      onReorderTasks(date, newOrder);
    }
  };

  const handleDragStart = (date: string) => {
    setActiveDragDate(date);
  };

  const handleDragEnd = () => {
    setActiveDragDate(null);
    toast({
      title: "סדר המשימות עודכן",
      description: "סדר המשימות החדש נשמר בהצלחה",
    });
  };

  if (isLoading) {
    return (
      <motion.div 
        className="flex flex-col justify-center items-center h-40 gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="h-10 w-10 text-primary" />
        </motion.div>
        <span className="text-muted-foreground">טוען משימות...</span>
      </motion.div>
    );
  }

  if (Object.keys(reorderedTasks).length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-8 bg-gradient-to-br from-accent/30 via-background to-accent/30 rounded-2xl border border-border/50 shadow-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center"
        >
          <ListTodo className="h-10 w-10 text-primary" />
        </motion.div>
        <motion.p 
          className="text-xl font-semibold text-foreground mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          אין משימות כרגע
        </motion.p>
        <motion.p 
          className="text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          התחל להוסיף משימות חדשות כדי להתחיל!
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(reorderedTasks).map(([date, tasks], index) => {
        const dateInfo = getDateLabel(date);
        const completedCount = getCompletedCount(tasks);
        const DateIcon = dateInfo?.icon || Calendar;
        
        return (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: activeDragDate === date ? 1.01 : 1
            }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={cn(
              "space-y-4 rounded-2xl overflow-hidden",
              activeDragDate === date && "ring-2 ring-primary/30 shadow-xl"
            )}
          >
            {/* Date header */}
            <motion.div 
              className={cn(
                "sticky top-0 z-10 py-4 px-5 rounded-xl",
                "bg-gradient-to-r from-accent/80 via-background/95 to-accent/80 backdrop-blur-md",
                "border border-border/50 shadow-sm",
                "flex justify-between items-center gap-4"
              )}
              whileHover={{ scale: 1.005 }}
            >
              <div className="flex items-center gap-3">
                {/* Date icon */}
                <motion.div 
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    dateInfo 
                      ? `bg-gradient-to-br ${dateInfo.color} text-primary-foreground shadow-lg`
                      : "bg-muted text-muted-foreground"
                  )}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  <DateIcon className="h-5 w-5" />
                </motion.div>
                
                <div className="flex flex-col">
                  {dateInfo && (
                    <span className={cn(
                      "text-sm font-bold bg-gradient-to-r bg-clip-text text-transparent",
                      dateInfo.color
                    )}>
                      {dateInfo.label}
                    </span>
                  )}
                  <h2 className="text-base font-medium text-foreground/80">
                    {formatDate(date)}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Task counter */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-task-low" />
                    <span className="font-medium text-muted-foreground">
                      {completedCount}/{tasks.length}
                    </span>
                  </div>
                </div>

                {/* Drag hint */}
                {tasks.length > 1 && !isMobile && (
                  <motion.div 
                    className="hidden md:flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <MoveVertical className="h-3 w-3" />
                    <span>גרור לסידור</span>
                  </motion.div>
                )}
                
                {/* Delete all button */}
                {tasks.length > 0 && onDeleteAllTasksForDate && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="sm:max-w-md rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>מחיקת כל המשימות</AlertDialogTitle>
                        <AlertDialogDescription>
                          האם אתה בטוח שברצונך למחוק את כל המשימות מתאריך {formatDate(date)}?
                          <br />
                          פעולה זו אינה הפיכה.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">ביטול</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDeleteAllTasksForDate(date)}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl"
                        >
                          מחק הכל
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </motion.div>

            {/* Task list */}
            <AnimatePresence mode="popLayout">
              <div className="space-y-3 px-1">
                {tasks.length > 0 && (
                  isMobile ? (
                    <div className="space-y-3">
                      {tasks.map((task, taskIndex) => (
                        <motion.div 
                          key={task.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: taskIndex * 0.05 }}
                        >
                          <TaskItem
                            task={task}
                            allTasks={allTasks}
                            onToggleTask={onToggleTask}
                            onTaskComplete={onTaskComplete}
                            onDeleteTask={onDeleteTask}
                            onEdit={onEditTask}
                            onUpdateDependencies={onUpdateTaskDependencies}
                            onUpdateProgress={onUpdateTaskProgress}
                            onUpdateProject={onUpdateTaskProject}
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
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
                            task={task}
                            allTasks={allTasks}
                            onToggleTask={onToggleTask}
                            onTaskComplete={onTaskComplete}
                            onDeleteTask={onDeleteTask}
                            onEdit={onEditTask}
                            onUpdateDependencies={onUpdateTaskDependencies}
                            onUpdateProgress={onUpdateTaskProgress}
                            onUpdateProject={onUpdateTaskProject}
                          />
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  )
                )}
              </div>
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TaskListContent;