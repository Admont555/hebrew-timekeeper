
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Task } from "@/types/task";
import {
  MoreVertical,
  Edit2,
  Trash2,
  MessageSquare,
  Paperclip,
  Copy,
  Link2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaskActionsProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onEdit: () => void;
  onToggleComments: () => void;
  onToggleAttachments: () => void;
  onToggleDependencies?: () => void;
  showAttachments: boolean;
  showDependencies?: boolean;
}

const TaskActions = ({
  task,
  onDelete,
  onEdit,
  onToggleComments,
  onToggleAttachments,
  onToggleDependencies,
  showAttachments,
  showDependencies = false,
}: TaskActionsProps) => {
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(task.title);
    toast({
      title: "הועתק ללוח",
      description: "תוכן המשימה הועתק ללוח",
    });
  };

  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <Button
        variant={showAttachments ? "default" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={onToggleAttachments}
      >
        <Paperclip className="h-4 w-4" />
        <span className="sr-only">קבצים מצורפים</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onToggleComments}
      >
        <MessageSquare className="h-4 w-4" />
        <span className="sr-only">תגובות</span>
      </Button>

      {onToggleDependencies && (
        <Button
          variant={showDependencies ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={onToggleDependencies}
        >
          <Link2 className="h-4 w-4" />
          <span className="sr-only">תלויות</span>
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">אפשרויות נוספות</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Edit2 className="ml-2 h-4 w-4" />
            <span>עריכה</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyToClipboard}>
            <Copy className="ml-2 h-4 w-4" />
            <span>העתק</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Trash2 className="ml-2 h-4 w-4" />
                <span>מחק</span>
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                <AlertDialogDescription>
                  פעולה זו תמחק את המשימה לצמיתות ולא ניתן יהיה לשחזר אותה.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ביטול</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(task.id)}>
                  מחק
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TaskActions;
