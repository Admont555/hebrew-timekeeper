import { Task, TasksByDate, TaskPriority } from "@/types/task";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import TaskItem from "../TaskItem";

interface TaskListContentProps {
  tasksByDate: TasksByDate;
  isLoading: boolean;
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newTitle: string, newDuration: number, newPriority: TaskPriority) => void;
}

const TaskListContent = ({
  tasksByDate,
  isLoading,
  onToggleTask,
  onTaskComplete,
  onDeleteTask,
  onEditTask,
}: TaskListContentProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "EEEE, d בMMMM yyyy", { locale: he });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (Object.keys(tasksByDate).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        לא נמצאו משימות
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(tasksByDate).map(([date, tasks]) => (
        <motion.div
          key={date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-4"
        >
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-2">
            <h2 className="text-lg font-semibold">{formatDate(date)}</h2>
          </div>
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleTask={onToggleTask}
                  onTaskComplete={onTaskComplete}
                  onDeleteTask={onDeleteTask}
                  onEdit={onEditTask}
                />
              ))}
            </div>
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default TaskListContent;