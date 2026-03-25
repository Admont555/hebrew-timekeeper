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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
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
  showAttachments,
}: TaskActionsProps) => {
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(task.title);
    toast({
      title: "הועתק ללוח",
      description: "תוכן המשימה הועתק ללוח",
    });
  };

  const hasComments = task.comments && task.comments.length > 0;
  const hasAttachments = task.attachments && task.attachments.length > 0;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 sm:gap-2 flex-row-reverse" dir="rtl">
        {/* Attachments Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={showAttachments ? "default" : "ghost"}
                size="icon"
                className={cn(
                  "h-9 w-9 sm:h-10 sm:w-10 rounded-xl relative transition-all duration-200",
                  showAttachments 
                    ? "bg-primary/90 text-primary-foreground shadow-md" 
                    : "hover:bg-primary/10 hover:text-primary"
                )}
                onClick={onToggleAttachments}
              >
                <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                {hasAttachments && (
                  <span className="absolute -top-1 -left-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-orange-500 text-[9px] sm:text-[10px] font-bold text-white shadow-sm">
                    {task.attachments!.length > 9 ? '9+' : task.attachments!.length}
                  </span>
                )}
                <span className="sr-only">קבצים מצורפים</span>
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" avoidCollisions={true} collisionPadding={8}>
            <p>קבצים מצורפים {hasAttachments ? `(${task.attachments!.length})` : ''}</p>
          </TooltipContent>
        </Tooltip>

        {/* Comments Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 sm:h-10 sm:w-10 rounded-xl relative transition-all duration-200",
                  hasComments 
                    ? "text-primary hover:bg-primary/10" 
                    : "hover:bg-muted"
                )}
                onClick={onToggleComments}
              >
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                {hasComments && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -left-1 flex items-center justify-center"
                  >
                    <span className="absolute h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary/20 animate-ping" />
                    <span className="relative flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-[9px] sm:text-[10px] font-bold text-primary-foreground shadow-md">
                      {task.comments!.length > 9 ? '9+' : task.comments!.length}
                    </span>
                  </motion.span>
                )}
                <span className="sr-only">תגובות</span>
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" avoidCollisions={true} collisionPadding={8}>
            <p>תגובות {hasComments ? `(${task.comments!.length})` : ''}</p>
          </TooltipContent>
        </Tooltip>

        {/* Edit Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border-2 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:border-blue-500 hover:bg-blue-500/10 transition-all duration-200"
                onClick={onEdit}
              >
                <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">עריכת משימה</span>
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>עריכת משימה</p>
          </TooltipContent>
        </Tooltip>

        {/* More Options Menu */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-muted transition-all duration-200"
                  >
                    <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only">אפשרויות נוספות</span>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>אפשרויות נוספות</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent 
            align="start" 
            className="min-w-[180px] bg-card/95 backdrop-blur-md border-border/50 shadow-xl rounded-xl p-1"
          >
            <DropdownMenuItem 
              onClick={handleCopyToClipboard} 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-muted transition-colors"
            >
              <Copy className="h-4 w-4 text-muted-foreground" />
              <span>העתק משימה</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-border/50" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                  onSelect={(e) => e.preventDefault()} 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>מחק משימה</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl" className="bg-card/95 backdrop-blur-md border-border/50 rounded-2xl max-w-md">
                <AlertDialogHeader className="text-right">
                  <AlertDialogTitle className="text-xl">האם אתה בטוח?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    פעולה זו תמחק את המשימה "{task.title}" לצמיתות ולא ניתן יהיה לשחזר אותה.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row gap-2 sm:gap-3">
                  <AlertDialogCancel className="flex-1 rounded-xl">ביטול</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(task.id)}
                    className="flex-1 bg-destructive hover:bg-destructive/90 rounded-xl"
                  >
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
