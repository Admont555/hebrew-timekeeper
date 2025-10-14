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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isDragging ? 1.03 : 1,
      }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ 
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ scale: isDragging ? 1.03 : 1.01 }}
      className={cn(
        "flex flex-col gap-5 p-6 relative group",
        getTaskCardClass(task.priority, task.completed),
        isDragging ? "cursor-grabbing shadow-2xl" : "cursor-grab"
      )}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-full py-4 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity duration-200">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-card/95 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-border"
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
              <div className="flex flex-col items-end gap-2 order-2 sm:order-1 mr-8">
                <span className={cn(
                  "task-title text-right",
                  task.completed && "task-title-completed"
                )}>
                  {task.title}
                </span>
                <span className="text-sm text-muted-foreground font-medium">
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

            {(task.progress || 0) > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4"
              >
                <TaskProgressBar 
                  progress={task.progress || 0} 
                  size="sm" 
                  className="w-full" 
                />
              </motion.div>
            )}

            <div className="flex items-center justify-between gap-4 mt-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="flex items-center justify-center"
                      onClick={handleCheckboxChange}
                    >
                      {isMobile ? (
                        <motion.button
                          type="button"
                          onClick={() => onToggleTask(task.id)}
                          whileTap={{ scale: 0.9 }}
                          className={cn(
                            "task-checkbox-mobile flex items-center justify-center",
                            task.completed 
                              ? "bg-[hsl(var(--task-complete))] text-primary-foreground" 
                              : "bg-background"
                          )}
                          aria-label="סמן משימה כהושלמה"
                        >
                          {task.completed && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <Check className="h-6 w-6" />
                            </motion.div>
                          )}
                        </motion.button>
                      ) : (
                        <Checkbox 
                          id={`task-${task.id}`}
                          checked={task.completed}
                          onCheckedChange={() => onToggleTask(task.id)}
                          className="task-checkbox"
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
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="border-t border-border pt-4"
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
            className="border-t border-border pt-4"
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
            className="border-t border-border pt-4"
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
