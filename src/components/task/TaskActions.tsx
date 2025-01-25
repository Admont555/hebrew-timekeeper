import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MessageSquare } from "lucide-react";
import { Task } from "@/types/task";

interface TaskActionsProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onToggleComments: () => void;
}

const TaskActions = ({ task, onDelete, onEdit, onToggleComments }: TaskActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(task.id)}
        className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
        aria-label="מחק משימה"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(task)}
        className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
        aria-label="ערוך משימה"
      >
        <Pencil className="h-4 w-4 text-blue-500" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleComments}
        className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200"
        aria-label="הצג/הסתר תגובות"
      >
        <MessageSquare className="h-4 w-4 text-purple-500" />
        {task.comments && task.comments.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {task.comments.length}
          </span>
        )}
      </Button>
    </div>
  );
};

export default TaskActions;