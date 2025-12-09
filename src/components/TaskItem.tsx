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
import { Check, GripVertical, Sparkles } from "lucide-react";
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

  const getTaskCardClass = (priority: 'low' | 'normal' | 'high', completed: boolean) => {
    if (completed) return 'task-card task-card-completed';
    
    switch (priority) {
      case 'high':
        return 'task-card task-card-high';
      case 'normal':
        return 'task-card task-card-normal';
      case 'low':
        return 'task-card task-card-low';
      default:
        return 'task-card task-card-normal';
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

  // Priority indicator dot with pulse animation for high priority
  const PriorityIndicator = () => {
    const dotClass = cn(
      "w-3 h-3 rounded-full absolute -top-1 -right-1",
      task.priority === 'high' && "bg-task-high animate-pulse",
      task.priority === 'normal' && "bg-task-normal",
      task.priority === 'low' && "bg-task-low"
    );
    
    return (
      <motion.div 
        className={dotClass}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isDragging ? 1.02 : 1,
      }}
      exit={{ opacity: 0, scale: 0.9, y: -30 }}
      transition={{ 
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        scale: isDragging ? 1.02 : 1.01,
        y: isDragging ? 0 : -2,
      }}
      className={cn(
        "flex flex-col gap-5 p-6 relative group overflow-hidden",
        getTaskCardClass(task.priority, task.completed),
        isDragging ? "cursor-grabbing shadow-2xl z-50" : "cursor-grab"
      )}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />
      
      {/* Priority indicator dot */}
      <PriorityIndicator />

      {/* Drag handle */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div 
              className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-full py-4 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-popover/95 backdrop-blur-sm">
            <p>גרור לשינוי סדר</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, scale: 0.95, rotateX: -10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.95, rotateX: 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-card/98 backdrop-blur-md p-5 rounded-xl shadow-xl border border-border/50"
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
            className="relative z-10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col items-end gap-2 order-2 sm:order-1 mr-8">
                <span className={cn(
                  "task-title text-right transition-all duration-300",
                  task.completed && "task-title-completed"
                )}>
                  {task.title}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-medium bg-muted/50 px-2 py-0.5 rounded-md">
                    {formatTime(task.timestamp)}
                  </span>
                  {task.completed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 text-xs text-task-complete bg-task-complete-bg px-2 py-0.5 rounded-md"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>הושלם</span>
                    </motion.div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 order-1 sm:order-2">
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

            {(task.progress || 0) > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-5"
              >
                <TaskProgressBar 
                  progress={task.progress || 0} 
                  size="md" 
                  className="w-full" 
                />
              </motion.div>
            )}

            <div className="flex items-center justify-between gap-4 mt-5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      type="button"
                      onClick={handleCheckboxChange}
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                      className={cn(
                        "relative flex items-center justify-center rounded-xl border-2 transition-all duration-300 shadow-sm",
                        isMobile ? "h-12 w-12" : "h-8 w-8",
                        task.completed 
                          ? "bg-gradient-to-br from-task-complete to-primary border-task-complete shadow-task-complete/30" 
                          : "bg-background/80 border-task-complete/50 hover:border-task-complete hover:shadow-lg hover:shadow-task-complete/20"
                      )}
                      aria-label="סמן משימה כהושלמה"
                    >
                      <AnimatePresence>
                        {task.completed && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          >
                            <Check className={cn(
                              "text-primary-foreground",
                              isMobile ? "h-7 w-7" : "h-5 w-5"
                            )} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="bg-popover/95 backdrop-blur-sm">
                    <p>{task.completed ? "סמן כלא מושלם" : "סמן כמושלם"}</p>
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
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="border-t border-border/50 pt-4"
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
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="border-t border-border/50 pt-4"
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
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="border-t border-border/50 pt-4"
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