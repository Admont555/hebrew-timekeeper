import { Task, Attachment } from "@/types/task";
import CountdownTimer from "./CountdownTimer";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import TaskComments from "./TaskComments";
import TaskActions from "./task/TaskActions";
import TaskPriorityComponent from "./task/TaskPriority";
import TaskAttachments from "./task/TaskAttachments";
import TaskProgressBar from "./task/TaskProgressBar";
import TaskDependencies from "./task/TaskDependencies";
import { Checkbox } from "./ui/checkbox";
import { Check, GripVertical } from "lucide-react";
import TaskForm from "./TaskForm";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface TaskItemProps {
  task: Task;
  allTasks: Task[];
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onUpdateDependencies?: (taskId: string, dependencies: string[]) => void;
  onUpdateProgress?: (taskId: string, progress: number) => void;
}

const TaskItem = ({ 
  task, 
  allTasks, 
  onToggleTask, 
  onTaskComplete, 
  onDeleteTask, 
  onEdit,
  onUpdateDependencies,
  onUpdateProgress
}: TaskItemProps) => {
  const [showComments, setShowComments] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const isMobile = useIsMobile();
  const [isDragging, setIsDragging] = useState(false);

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

  // Toggle task dependencies view
  const handleToggleDependencies = () => {
    setShowDependencies(!showDependencies);
  };

  // Update task progress
  const handleProgressUpdate = (progress: number) => {
    if (onUpdateProgress) {
      onUpdateProgress(task.id, progress);
    }
  };

  // Check if task can be completed (all dependencies must be completed)
  const canCompleteTask = () => {
    if (!task.dependencies?.length) return true;
    
    // Check if all dependency tasks are completed
    return task.dependencies.every(depId => {
      const depTask = allTasks.find(t => t.id === depId);
      return depTask?.completed === true;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" : "none"
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col gap-4 p-5 rounded-lg border shadow-sm relative",
        task.completed 
          ? "bg-gray-50/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-75" 
          : `${getPriorityBgColor(task.priority)} ${getPriorityBorderColor(task.priority)}`,
        "hover:shadow-md transition-all duration-300",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
    >
      {/* Drag handle indicator */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center h-full py-4 opacity-30 hover:opacity-100 transition-opacity">
              <GripVertical className="h-5 w-5 text-gray-500" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>גרור לשינוי סדר</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

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
              <div className="flex items-center gap-4 order-1 sm:order-1">
                <TaskActions
                  task={task}
                  onDelete={onDeleteTask}
                  onEdit={handleEditClick}
                  onToggleComments={() => setShowComments(!showComments)}
                  onToggleAttachments={() => setShowAttachments(!showAttachments)}
                  onToggleDependencies={handleToggleDependencies}
                  showAttachments={showAttachments}
                  showDependencies={showDependencies}
                />
                <TaskPriorityComponent priority={task.priority} />
              </div>
              <div className="flex flex-col items-end gap-1 order-2 sm:order-2 ml-6">
                <span className={cn(
                  "text-lg font-medium text-right",
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

            {/* Progress bar */}
            <div className="mt-3">
              <TaskProgressBar 
                progress={task.progress || 0} 
                size="sm" 
                className="w-full" 
              />
            </div>

            <div className="flex items-center justify-between gap-4 mt-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                            !canCompleteTask() && !task.completed
                              ? "border-gray-300 bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed"
                              : task.completed 
                                ? "border-purple-500 bg-purple-500 text-white" 
                                : "border-purple-300 dark:border-purple-700"
                          )}
                          aria-label="סמן משימה כהושלמה"
                          disabled={!canCompleteTask() && !task.completed}
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
                            !canCompleteTask() && !task.completed
                              ? "border-gray-300 bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed"
                              : task.completed 
                                ? "border-purple-500 bg-purple-500 text-white" 
                                : "border-purple-300 dark:border-purple-700"
                          )}
                          aria-label="סמן משימה כהושלמה"
                          disabled={!canCompleteTask() && !task.completed}
                        />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>סמן כמושלם</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <CountdownTimer
                duration={task.duration}
                startTime={task.startTime}
                isCompleted={task.completed}
                onComplete={() => onTaskComplete(task.id)}
              />
            </div>

            {/* Warning if dependencies are not complete */}
            {!canCompleteTask() && !task.completed && (
              <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 text-right">
                לא ניתן לסמן כבוצע - יש להשלים את המשימות הקשורות תחילה
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDependencies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t pt-3 mt-2"
          >
            <TaskDependencies
              task={task}
              allTasks={allTasks}
              onUpdateDependencies={onUpdateDependencies || ((_, __) => {})}
            />
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
