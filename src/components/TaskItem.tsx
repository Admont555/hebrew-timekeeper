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
      className={`flex items-center justify-between p-4 rounded-lg border ${
        task.completed 
          ? "bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700" 
          : "bg-white/50 dark:bg-gray-800/50 border-purple-100 dark:border-gray-700"
      } hover:shadow-md transition-all duration-300`}
    >
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteTask(task.id)}
            className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task)}
            className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
            aria-label="Edit task"
          >
            <Pencil className="h-4 w-4 text-blue-500" />
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
          className="h-5 w-5 rounded border-gray-300 text-purple-600 transition-colors duration-200 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
          aria-label="Toggle task completion"
        />
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={`text-lg ${task.completed ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-700 dark:text-gray-300"}`}>
          {task.title}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatTime(task.timestamp)}
        </span>
      </div>
    </motion.div>
  );
};

export default TaskItem;