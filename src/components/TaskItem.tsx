import { Task } from "@/types/task";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { motion } from "framer-motion";

interface TaskItemProps {
  task: Task;
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem = ({ task, onToggleTask, onTaskComplete, onDeleteTask, onEdit }: TaskItemProps) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center justify-between p-3 rounded-lg border ${
        task.completed ? "bg-muted" : "bg-card"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteTask(task.id)}
            className="h-8 w-8"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task)}
            className="h-8 w-8"
            aria-label="Edit task"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        <CountdownTimer
          duration={task.duration}
          startTime={task.startTime}
          isCompleted={task.completed}
          onComplete={() => onTaskComplete(task.id)}
        />
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleTask(task.id)}
          className="h-5 w-5"
          aria-label="Toggle task completion"
        />
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={task.completed ? "line-through text-muted-foreground" : ""}>
          {task.title}
        </span>
        <span className="text-sm text-muted-foreground">
          {formatTime(task.timestamp)}
        </span>
      </div>
    </motion.div>
  );
};

export default TaskItem;