
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    <TooltipProvider>
      <div className="flex items-center space-x-0 space-x-reverse rtl:space-x-reverse space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showAttachments ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={onToggleAttachments}
            >
              <Paperclip className="h-4 w-4" />
              <span className="sr-only">קבצים מצורפים</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>קבצים מצורפים</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggleComments}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="sr-only">תגובות</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>תגובות</p>
          </TooltipContent>
        </Tooltip>

        {onToggleDependencies && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showDependencies ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={onToggleDependencies}
              >
                <Link2 className="h-4 w-4" />
                <span className="sr-only">תלויות</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>משימות תלויות</p>
            </TooltipContent>
          </Tooltip>
        )}

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">אפשרויות נוספות</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>אפשרויות נוספות</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit} className="flex flex-row-reverse justify-between">
              <Edit2 className="mr-2 h-4 w-4" />
              <span>עריכה</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyToClipboard} className="flex flex-row-reverse justify-between">
              <Copy className="mr-2 h-4 w-4" />
              <span>העתק</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex flex-row-reverse justify-between">
                  <Trash2 className="mr-2 h-4 w-4" />
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
    </TooltipProvider>
  );
};

export default TaskActions;
