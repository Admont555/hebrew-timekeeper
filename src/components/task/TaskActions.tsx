
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

interface TaskActionsProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
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

  return (
    <div className="flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
              aria-label="מחק משימה"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>מחק משימה</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(task)}
              className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
              aria-label="ערוך משימה"
            >
              <Pencil className="h-4 w-4 text-blue-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>ערוך משימה</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleAttachments}
              className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200"
              aria-label="צרף קובץ"
            >
              <Paperclip className="h-4 w-4 text-purple-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>צרף קובץ</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
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
          <TooltipContent side="bottom">
            <p>שתף משימה</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleComments}
                className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200"
                aria-label="הצג/הסתר תגובות"
              >
                <MessageSquare className="h-4 w-4 text-purple-500" />
              </Button>
              {task.comments && task.comments.length > 0 && (
                <span className="absolute -top-1 left-5 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {task.comments.length}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>הצג/הסתר תגובות</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default TaskActions;
