import { Task, Attachment } from "@/types/task";
import CountdownTimer from "./CountdownTimer";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import TaskComments from "./TaskComments";
import TaskActions from "./task/TaskActions";
import TaskPriorityComponent from "./task/TaskPriority";
import TaskAttachments from "./task/TaskAttachments";
import TaskProgressBar from "./task/TaskProgressBar";
import { Check, GripVertical, Sparkles } from "lucide-react";
import TaskForm from "./TaskForm";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useCategories, Category } from "@/hooks/useCategories";

interface TaskItemProps {
  task: Task;
  allTasks: Task[];
  onToggleTask: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onUpdateProgress?: (taskId: string, progress: number) => void;
}

const TaskItem = ({ 
  task, 
  allTasks, 
  onToggleTask, 
  onTaskComplete, 
  onDeleteTask, 
  onEdit,
  onUpdateProgress,
}: TaskItemProps) => {
  const [showComments, setShowComments] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const isMobile = useIsMobile();
  const [isDragging, setIsDragging] = useState(false);

  const category = getCategoryById(task.category_id);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTaskCardClass = (priority: 'low' | 'normal' | 'high', completed: boolean) => {
    if (completed) return 'task-card task-card-completed';
    switch (priority) {
      case 'high': return 'task-card task-card-high';
      case 'normal': return 'task-card task-card-normal';
      case 'low': return 'task-card task-card-low';
      default: return 'task-card task-card-normal';
    }
  };

  const handleCommentsUpdate = (newComments: string[]) => {
    task.comments = newComments;
  };

  const handleAttachmentsUpdate = (newAttachments: Attachment[]) => {
    task.attachments = newAttachments;
  };

  const handleEditClick = () => setIsEditing(true);

  const handleEditSubmit = (title: string, duration: number, priority: 'low' | 'normal' | 'high', categoryId?: string) => {
    const editedTask = { ...task, title, duration, priority, category_id: categoryId };
    onEdit(editedTask);
    setIsEditing(false);
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleTask(task.id);
  };

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
      animate={{ opacity: 1, y: 0, scale: isDragging ? 1.02 : 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -30 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: isDragging ? 1.02 : 1.01, y: isDragging ? 0 : -2 }}
      dir="rtl"
       className={cn(
        "flex flex-col gap-3 p-4 sm:p-5 relative group overflow-hidden",
        getTaskCardClass(task.priority, task.completed),
        isDragging ? "cursor-grabbing shadow-2xl z-50" : "cursor-grab"
      )}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />
      <PriorityIndicator />

      <div 
        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center py-4 opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-grab active:cursor-grabbing"
        title="גרור לשינוי סדר"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground pointer-events-none" />
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, scale: 0.95, rotateX: -10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.95, rotateX: 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-card/98 backdrop-blur-md p-4 sm:p-5 rounded-xl shadow-xl border border-border/50"
          >
            <TaskForm
              onAddTask={handleEditSubmit}
              initialTitle={task.title}
              initialDuration={task.duration || 0}
              initialPriority={task.priority || "normal"}
              initialCategoryId={task.category_id || ""}
              submitLabel="עדכן"
              onCancel={() => setIsEditing(false)}
              isOpen={true}
              onOpenChange={(open) => { if (!open) setIsEditing(false); }}
            />
          </motion.div>
        ) : (
          <motion.div key="display" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10">
            <div className="flex items-start justify-between gap-3">
              {/* Right side: Title + meta */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5 pr-6">
                <span className={cn(
                  "task-title text-right text-base sm:text-lg leading-snug font-medium",
                  task.completed && "task-title-completed"
                )}>
                  {task.title}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md">
                    {formatTime(task.timestamp)}
                  </span>
                  {category && (
                    <span className="text-xs font-medium bg-accent/50 text-accent-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </span>
                  )}
                  <TaskPriorityComponent priority={task.priority} />
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

              {/* Left side: Checkbox */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      type="button"
                      onClick={handleCheckboxChange}
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                      className={cn(
                        "relative flex-shrink-0 flex items-center justify-center rounded-xl border-2 transition-all duration-300 shadow-sm",
                        isMobile ? "h-11 w-11" : "h-9 w-9",
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
                            <Check className={cn("text-primary-foreground", isMobile ? "h-6 w-6" : "h-4 w-4")} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center" avoidCollisions={true} collisionPadding={8}>
                    <p>{task.completed ? "סמן כלא מושלם" : "סמן כמושלם"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {(task.progress || 0) > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3">
                <TaskProgressBar progress={task.progress || 0} size="md" className="w-full" />
              </motion.div>
            )}

            <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border/20">
              <CountdownTimer
                duration={task.duration}
                startTime={task.startTime}
                isCompleted={task.completed}
                onComplete={() => onTaskComplete(task.id)}
              />
              <TaskActions
                task={task}
                onDelete={onDeleteTask}
                onEdit={handleEditClick}
                onToggleComments={() => setShowComments(!showComments)}
                onToggleAttachments={() => setShowAttachments(!showAttachments)}
                showAttachments={showAttachments}
              />
            </div>
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
            <TaskAttachments taskId={task.id} attachments={task.attachments || []} onAttachmentsUpdate={handleAttachmentsUpdate} showUploadField={showAttachments} />
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
            <TaskComments taskId={task.id} comments={task.comments || []} onCommentsUpdate={handleCommentsUpdate} attachments={task.attachments || []} onAttachmentsUpdate={handleAttachmentsUpdate} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskItem;
