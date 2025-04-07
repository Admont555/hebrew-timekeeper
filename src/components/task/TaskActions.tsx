
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MessageSquare, Paperclip } from "lucide-react";
import { Task } from "@/types/task";
import TaskShare from "./TaskShare";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TaskActionsProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onEdit: () => void;
  onToggleComments: () => void;
  onToggleAttachments: () => void;
  showAttachments: boolean;
}

const TaskActions = ({ 
  task, 
  onDelete, 
  onEdit, 
  onToggleComments, 
  onToggleAttachments,
  showAttachments 
}: TaskActionsProps) => {
  const handleAssigneesUpdate = (newAssignees: string[]) => {
    task.assigned_to = newAssignees;
  };

  const buttonVariants = {
    trash: "hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-600",
    edit: "hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 hover:text-blue-600",
    paperclip: "hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-500 hover:text-purple-600",
    message: "hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-500 hover:text-purple-600",
  };

  return (
    <div className="flex gap-2">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
              className={cn(
                "h-8 w-8 transition-all duration-200 rounded-full",
                buttonVariants.trash
              )}
              aria-label="מחק משימה"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white dark:bg-gray-800 shadow-lg">
            <p>מחק משימה</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className={cn(
                "h-8 w-8 transition-all duration-200 rounded-full",
                buttonVariants.edit
              )}
              aria-label="ערוך משימה"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white dark:bg-gray-800 shadow-lg">
            <p>ערוך משימה</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleAttachments}
              className={cn(
                "h-8 w-8 transition-all duration-200 rounded-full",
                buttonVariants.paperclip,
                showAttachments && "bg-purple-100 dark:bg-purple-900/30"
              )}
              aria-label="צרף קובץ"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white dark:bg-gray-800 shadow-lg">
            <p>צרף קובץ</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <TaskShare
                taskId={task.id}
                currentAssignees={task.assigned_to || []}
                onAssigneesUpdate={handleAssigneesUpdate}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white dark:bg-gray-800 shadow-lg">
            <p>שתף משימה</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleComments}
                className={cn(
                  "h-8 w-8 transition-all duration-200 rounded-full",
                  buttonVariants.message,
                  task.comments && task.comments.length > 0 && "bg-purple-100 dark:bg-purple-900/30"
                )}
                aria-label="הצג/הסתר תגובות"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              {task.comments && task.comments.length > 0 && (
                <span className="absolute -top-1 left-5 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {task.comments.length}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white dark:bg-gray-800 shadow-lg">
            <p>הצג/הסתר תגובות</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default TaskActions;
