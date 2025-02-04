import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, TasksByDate, TaskPriority } from "@/types/task";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useState, useMemo, useRef, useEffect } from "react";
import TaskForm from "./TaskForm";
import { useToast } from "@/hooks/use-toast";
import TaskItem from "./TaskItem";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { Trash2, Loader2 } from "lucide-react";
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

interface TaskListProps {
  tasks: TasksByDate;
  isLoading: boolean;
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newTitle: string, newDuration: number, newPriority: TaskPriority) => void;
}

const TaskList = ({
  tasks,
  isLoading,
  onToggleTask,
  onTaskComplete,
  onDeleteTask,
  onEditTask,
}: TaskListProps) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const { toast } = useToast();
  const activeTaskRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "EEEE, d בMMMM yyyy", { locale: he });
  };

  const handleEdit = (task: Task) => {
    setEditingTaskId(task.id);
  };

  const handleEditSubmit = (title: string, duration: number, priority: TaskPriority) => {
    if (editingTaskId) {
      onEditTask(editingTaskId, title, duration, priority);
      setEditingTaskId(null);
    }
  };

  const getRemainingTime = (task: Task) => {
    if (!task.startTime || task.completed) return Infinity;
    const start = new Date(task.startTime).getTime();
    const now = new Date().getTime();
    const elapsedSeconds = Math.floor((now - start) / 1000);
    return task.duration * 60 - elapsedSeconds;
  };

  const deleteDayTasks = (date: string) => {
    const tasksForDay = tasks[date];
    let deletedCount = 0;
    
    tasksForDay.forEach((task) => {
      onDeleteTask(task.id);
      deletedCount++;
    });

    if (deletedCount > 0) {
      toast({
        title: "משימות נמחקו",
        description: `${deletedCount} משימות מתאריך ${formatDate(date)} נמחקו בהצלחה`,
      });
    }
  };

  const organizeTasksByDate = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const organizedTasks: TasksByDate = { ...tasks };

    Object.entries(tasks).forEach(([date, dateTasks]) => {
      if (date < today) {
        dateTasks.forEach((task) => {
          if (!task.completed) {
            if (organizedTasks[date]) {
              organizedTasks[date] = organizedTasks[date].filter(t => t.id !== task.id);
              if (organizedTasks[date].length === 0) {
                delete organizedTasks[date];
              }
            }

            if (!organizedTasks[today]) {
              organizedTasks[today] = [];
            }
            if (!organizedTasks[today].some(t => t.id === task.id)) {
              organizedTasks[today].push({
                ...task,
                date: today
              });
            }
          }
        });
      }
    });

    return organizedTasks;
  }, [tasks]);

  const sortedDates = useMemo(
    () =>
      Object.keys(organizeTasksByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
    [organizeTasksByDate]
  );

  const sortTasks = useMemo(
    () => (tasksArray: Task[]) => {
      return [...tasksArray].sort((a, b) => {
        if (!a.completed && b.completed) return -1;
        if (a.completed && !b.completed) return 1;

        if (!a.completed && !b.completed) {
          const aRemaining = getRemainingTime(a);
          const bRemaining = getRemainingTime(b);

          const aUnderOneMinute = aRemaining <= 60;
          const bUnderOneMinute = bRemaining <= 60;

          if (aUnderOneMinute && !bUnderOneMinute) return -1;
          if (!aUnderOneMinute && bUnderOneMinute) return 1;

          return aRemaining - bRemaining;
        }

        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
    },
    []
  );

  // Function to find the active task
  const findActiveTask = () => {
    for (const date of sortedDates) {
      const tasksForDate = organizeTasksByDate[date];
      const activeTask = tasksForDate.find(
        task => task.startTime && !task.completed
      );
      if (activeTask) return activeTask;
    }
    return null;
  };

  // Effect to scroll to active task
  useEffect(() => {
    const activeTask = findActiveTask();
    if (activeTask && activeTaskRef.current && scrollAreaRef.current) {
      activeTaskRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [tasks]);

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 w-full rounded-lg p-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-[600px]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : (
        sortedDates.map((date) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8 last:mb-0"
          >
            <div className="flex items-center justify-between mb-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    מחק את כל המשימות
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="text-right">
                  <AlertDialogHeader>
                    <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                    <AlertDialogDescription>
                      פעולה זו תמחק את כל המשימות מתאריך {formatDate(date)}. לא ניתן לבטל פעולה זו.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-row-reverse sm:justify-start">
                    <AlertDialogAction onClick={() => deleteDayTasks(date)}>
                      כן, מחק הכל
                    </AlertDialogAction>
                    <AlertDialogCancel>ביטול</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <h2 className="text-2xl font-bold text-right text-gray-800 dark:text-gray-200">
                {formatDate(date)}
              </h2>
            </div>
            <div className="space-y-3 rounded-lg">
              <AnimatePresence mode="popLayout">
                {sortTasks(organizeTasksByDate[date]).map((task: Task) => {
                  const isActiveTask = task.startTime && !task.completed;
                  return (
                    <div
                      key={task.id}
                      ref={isActiveTask ? activeTaskRef : null}
                      className={`transition-all duration-300 ${
                        isActiveTask ? 'scale-102 ring-2 ring-purple-500 ring-opacity-50' : ''
                      }`}
                    >
                      {editingTaskId === task.id ? (
                        <div className="mb-4 bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
                          <TaskForm
                            onAddTask={handleEditSubmit}
                            initialTitle={task.title}
                            initialDuration={task.duration}
                            initialPriority={task.priority}
                            submitLabel="עדכן"
                            onCancel={() => setEditingTaskId(null)}
                          />
                        </div>
                      ) : (
                        <TaskItem
                          task={task}
                          onToggleTask={onToggleTask}
                          onTaskComplete={onTaskComplete}
                          onDeleteTask={onDeleteTask}
                          onEdit={handleEdit}
                        />
                      )}
                    </div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        ))
      )}
    </ScrollArea>
  );
};

export default TaskList;