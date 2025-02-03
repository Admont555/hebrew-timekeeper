import { Task } from "@/types/task";
import CountdownTimer from "./CountdownTimer";
import { motion } from "framer-motion";
import { useState } from "react";
import TaskComments from "./TaskComments";
import TaskActions from "./task/TaskActions";
import TaskPriority from "./task/TaskPriority";
import TaskAttachments from "./task/TaskAttachments";

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

  const handleAttachmentsUpdate = (newAttachments: { name: string; url: string }[]) => {
    task.attachments = newAttachments;
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
          <TaskActions
            task={task}
            onDelete={onDeleteTask}
            onEdit={onEdit}
            onToggleComments={() => setShowComments(!showComments)}
          />
          <TaskPriority priority={task.priority} />
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
          aria-label="סמן משימה כהושלמה"
        />
      </div>

      <TaskAttachments
        taskId={task.id}
        attachments={task.attachments || []}
        onAttachmentsUpdate={handleAttachmentsUpdate}
      />
      
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