import { Task } from "@/types/task";
import { Button } from "./ui/button";
import { Pencil, Trash2, Flag, MessageSquare } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { motion } from "framer-motion";
import { useState } from "react";
import TaskComments from "./TaskComments";

interface TaskItemProps {
  task: Task;
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem = ({ task, onToggleTask, onTaskComplete, onDeleteTask, onEdit }: TaskItemProps) => {
  const [showComments, setShowComments] = useState(false);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityColor = (priority: 'low' | 'normal' | 'high') => {
    switch (priority) {
      case 'high':
        return 'text-red-500 dark:text-red-400';
      case 'normal':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'low':
        return 'text-green-500 dark:text-green-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getPriorityBgColor = (priority: 'low' | 'normal' | 'high') => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'normal':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'bg-green-50 dark:bg-green-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-800/50';
    }
  };

  const handleCommentsUpdate = (newComments: string[]) => {
    task.comments = newComments;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col gap-4 p-4 rounded-lg border 
        ${task.completed 
          ? "bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700" 
          : `${getPriorityBgColor(task.priority)} border-purple-100 dark:border-gray-700`}
        hover:shadow-md transition-all duration-300`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 order-2 sm:order-1">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowComments(!showComments)}
              className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200"
              aria-label="Toggle comments"
            >
              <MessageSquare className="h-4 w-4 text-purple-500" />
              {task.comments && task.comments.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {task.comments.length}
                </span>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Flag className={`h-4 w-4 ${getPriorityColor(task.priority)}`} />
            <span className={`text-sm ${getPriorityColor(task.priority)}`}>
              {task.priority === 'high' ? 'דחוף' : task.priority === 'normal' ? 'רגיל' : 'נמוך'}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 order-1 sm:order-2">
          <span className={`text-lg ${task.completed ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-700 dark:text-gray-300"}`}>
            {task.title}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatTime(task.timestamp)}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
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
      {showComments && (
        <TaskComments
          taskId={task.id}
          comments={task.comments || []}
          onCommentsUpdate={handleCommentsUpdate}
        />
      )}
    </motion.div>
  );
};

export default TaskItem;