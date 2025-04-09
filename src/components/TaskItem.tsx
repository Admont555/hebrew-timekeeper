
import { Task, Attachment } from "@/types/task";
import CountdownTimer from "./CountdownTimer";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import TaskComments from "./TaskComments";
import TaskActions from "./task/TaskActions";
import TaskPriorityComponent from "./task/TaskPriority";
import TaskAttachments from "./task/TaskAttachments";
import { Checkbox } from "./ui/checkbox";
import { Check } from "lucide-react";
import TaskForm from "./TaskForm";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface TaskItemProps {
  task: Task;
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem = ({ task, onToggleTask, onTaskComplete, onDeleteTask, onEdit }: TaskItemProps) => {
  const [showComments, setShowComments] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const isMobile = useIsMobile();

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityBgColor = (priority: 'low' | 'normal' | 'high') => {
    switch (priority) {
      case 'high':
        return 'bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-900/30 dark:to-red-900/10';
      case 'normal':
        return 'bg-gradient-to-r from-yellow-50 to-yellow-50/50 dark:from-yellow-900/30 dark:to-yellow-900/10';
      case 'low':
        return 'bg-gradient-to-r from-green-50 to-green-50/50 dark:from-green-900/30 dark:to-green-900/10';
      default:
        return 'bg-gray-50 dark:bg-gray-800/50';
    }
  };

  const getPriorityBorderColor = (priority: 'low' | 'normal' | 'high') => {
    switch (priority) {
      case 'high':
        return 'border-red-200 dark:border-red-900/30';
      case 'normal':
        return 'border-yellow-200 dark:border-yellow-900/30';
      case 'low':
        return 'border-green-200 dark:border-green-900/30';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  };

  const handleCommentsUpdate = (newComments: string[]) => {
    task.comments = newComments;
  };

  const handleAttachmentsUpdate = (newAttachments: Attachment[]) => {
    task.attachments = newAttachments;
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditSubmit = (title: string, duration: number, priority: 'low' | 'normal' | 'high') => {
    // Create a modified task object to pass to the edit handler
    const editedTask = {
      ...task,
      title,
      duration,
      priority
    };
    
    onEdit(editedTask);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    // Prevent event propagation to avoid conflicts with Reorder drag functionality
    e.stopPropagation();
    onToggleTask(task.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col gap-4 p-5 rounded-lg border shadow-sm",
        task.completed 
          ? "bg-gray-50/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-75" 
          : `${getPriorityBgColor(task.priority)} ${getPriorityBorderColor(task.priority)}`,
        "hover:shadow-md transition-all duration-300"
      )}
    >
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white/90 dark:bg-gray-700/90 p-4 rounded-lg mb-2 shadow-inner"
          >
            <TaskForm
              onAddTask={handleEditSubmit}
              initialTitle={task.title}
              initialDuration={task.duration || 0}
              initialPriority={task.priority || "normal"}
              submitLabel="עדכן"
              onCancel={handleEditCancel}
            />
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 order-2 sm:order-1">
                <TaskActions
                  task={task}
                  onDelete={onDeleteTask}
                  onEdit={handleEditClick}
                  onToggleComments={() => setShowComments(!showComments)}
                  onToggleAttachments={() => setShowAttachments(!showAttachments)}
                  showAttachments={showAttachments}
                />
                <TaskPriorityComponent priority={task.priority} />
              </div>
              <div className="flex flex-col items-end gap-1 order-1 sm:order-2">
                <span className={cn(
                  "text-lg font-medium",
                  task.completed 
                    ? "line-through text-gray-400 dark:text-gray-500" 
                    : "text-gray-800 dark:text-gray-200"
                )}>
                  {task.title}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatTime(task.timestamp)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mt-2">
              <CountdownTimer
                duration={task.duration}
                startTime={task.startTime}
                isCompleted={task.completed}
                onComplete={() => onTaskComplete(task.id)}
              />
              <div 
                className="flex items-center justify-center"
                onClick={handleCheckboxChange}
              >
                {isMobile ? (
                  // Use a regular button for mobile to improve touch interactions
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className={cn(
                      "h-10 w-10 min-h-[44px] min-w-[44px] rounded-md border-2 transition-colors duration-300 flex items-center justify-center",
                      task.completed 
                        ? "border-purple-500 bg-purple-500 text-white" 
                        : "border-purple-300 dark:border-purple-700"
                    )}
                    aria-label="סמן משימה כהושלמה"
                  >
                    {task.completed && <Check className="h-6 w-6" />}
                  </button>
                ) : (
                  // Use Checkbox component for desktop
                  <Checkbox 
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => onToggleTask(task.id)}
                    className={cn(
                      "h-6 w-6 min-h-[24px] min-w-[24px] rounded-md border-2 transition-colors duration-300",
                      task.completed 
                        ? "border-purple-500 bg-purple-500 text-white" 
                        : "border-purple-300 dark:border-purple-700"
                    )}
                    aria-label="סמן משימה כהושלמה"
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAttachments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TaskAttachments
              taskId={task.id}
              attachments={task.attachments || []}
              onAttachmentsUpdate={handleAttachmentsUpdate}
              showUploadField={showAttachments}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TaskComments
              taskId={task.id}
              comments={task.comments || []}
              onCommentsUpdate={handleCommentsUpdate}
              attachments={task.attachments || []}
              onAttachmentsUpdate={handleAttachmentsUpdate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskItem;
