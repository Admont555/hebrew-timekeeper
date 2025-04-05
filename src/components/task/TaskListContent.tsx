
import { Task, TasksByDate, TaskPriority } from "@/types/task";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { Loader2, MoveVertical } from "lucide-react";
import TaskItem from "../TaskItem";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";

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
  const [reorderedTasks, setReorderedTasks] = useState<TasksByDate>(tasksByDate);

  useEffect(() => {
    setReorderedTasks(tasksByDate);
  }, [tasksByDate]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "EEEE, d בMMMM yyyy", { locale: he });
  };

  const handleEditTask = (task: Task) => {
    onEditTask(task.id, task.title, task.duration, task.priority);
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
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-2 flex justify-between items-center">
            <h2 className="text-lg font-semibold">{formatDate(date)}</h2>
            <div className="text-xs text-muted-foreground">
              {tasks.length > 1 && (
                <div className="flex items-center gap-1">
                  <MoveVertical className="h-3 w-3" />
                  <span>גרור כדי לסדר מחדש</span>
                </div>
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
                        onEdit={handleEditTask}
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
