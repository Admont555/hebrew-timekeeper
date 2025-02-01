import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/types/task";
import { MoreVertical, Pencil, Trash2, MessageSquare } from "lucide-react";
import SaveAsTemplate from "./SaveAsTemplate";

interface TaskActionsProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onToggleComments: () => void;
}

const TaskActions = ({ task, onDelete, onEdit, onToggleComments }: TaskActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(task)}>
          <Pencil className="h-4 w-4 mr-2" />
          ערוך
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(task.id)}>
          <Trash2 className="h-4 w-4 mr-2" />
          מחק
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onToggleComments}>
          <MessageSquare className="h-4 w-4 mr-2" />
          תגובות
        </DropdownMenuItem>
        <SaveAsTemplate task={task} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskActions;