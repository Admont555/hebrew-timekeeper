import { Task, Attachment } from "@/types/task";
import CountdownTimer from "./CountdownTimer";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import TaskComments from "./TaskComments";
import TaskActions from "./task/TaskActions";
import TaskPriorityComponent from "./task/TaskPriority";
import TaskAttachments from "./task/TaskAttachments";
import TaskProgressBar from "./task/TaskProgressBar";
import TaskProjectLink from "./task/TaskProjectLink";
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
  onUpdateProject?: (taskId: string, projectId: string | null) => void;
}

const TaskItem = ({ 
  task, 
  allTasks, 
  onToggleTask, 
  onTaskComplete, 
  onDeleteTask, 
  onEdit,
  onUpdateDependencies,
  onUpdateProgress,
  onUpdateProject
}: TaskItemProps) => {
  const [showComments, setShowComments] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showProject, setShowProject] = useState(false);
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
    e.stopPropagation();
    onToggleTask(task.id);
  };

  const handleToggleProject = () => {
    setShowProject(!showProject);
  };

  const handleProgressUpdate = (progress: number) => {
    if (onUpdateProgress) {
      onUpdateProgress(task.id, progress);
    }
  };

  const handleProjectUpdate = (taskId: string, projectId: string | null) => {
    if (onUpdateProject) {
      onUpdateProject(taskId, projectId);
    }
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
              <div className="flex flex-col items-end gap-1 order-2 sm:order-1 mr-6">
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
              <div className="flex items-center gap-4 order-1 sm:order-2">
                <TaskPriorityComponent priority={task.priority} />
                <TaskActions
                  task={task}
                  onDelete={onDeleteTask}
                  onEdit={handleEditClick}
                  onToggleComments={() => setShowComments(!showComments)}
                  onToggleAttachments={() => setShowAttachments(!showAttachments)}
                  onToggleDependencies={handleToggleProject}
                  showAttachments={showAttachments}
                  showDependencies={showProject}
                />
              </div>
            </div>

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
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProject && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t pt-3 mt-2"
          >
            <TaskProjectLink
              taskId={task.id}
              currentProjectId={task.project_id}
              onUpdateProject={handleProjectUpdate}
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
