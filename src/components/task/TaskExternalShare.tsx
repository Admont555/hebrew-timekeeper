import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, MessageCircle, Mail, Copy } from "lucide-react";
import { Task } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskExternalShareProps {
  task: Task;
}

const TaskExternalShare = ({ task }: TaskExternalShareProps) => {
  const { toast } = useToast();

  const formatTaskForShare = () => {
    const priority = task.priority === 'high' ? '🔴 גבוהה' : 
                    task.priority === 'normal' ? '🟡 רגילה' : '🟢 נמוכה';
    
    const duration = task.duration ? `⏱️ ${task.duration} דקות` : '';
    const date = task.date ? `📅 ${new Date(task.date).toLocaleDateString('he-IL')}` : '';
    
    return `📋 *משימה חדשה*

${task.title}

עדיפות: ${priority}
${duration}
${date}

_נשלח מאפליקציית מעקב המשימות_`;
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(formatTaskForShare());
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
    
    toast({
      title: "נפתח וואטסאפ",
      description: "המשימה מוכנה לשיתוף בוואטסאפ",
    });
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`משימה: ${task.title}`);
    const body = encodeURIComponent(formatTaskForShare());
    const url = `mailto:?subject=${subject}&body=${body}`;
    window.open(url, '_blank');
    
    toast({
      title: "נפתח אימייל",
      description: "המשימה מוכנה לשיתוף באימייל",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formatTaskForShare());
    toast({
      title: "הועתק ללוח",
      description: "פרטי המשימה הועתקו ללוח",
    });
  };

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">שיתוף חיצוני</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>שיתוף חיצוני</p>
          </TooltipContent>
        </Tooltip>
        
        <DropdownMenuContent align="end" className="w-48 text-right">
          <DropdownMenuItem 
            onClick={shareViaWhatsApp}
            className="flex items-center justify-end gap-2 cursor-pointer"
          >
            <span>שיתוף בוואטסאפ</span>
            <MessageCircle className="h-4 w-4 text-green-600" />
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={shareViaEmail}
            className="flex items-center justify-end gap-2 cursor-pointer"
          >
            <span>שיתוף באימייל</span>
            <Mail className="h-4 w-4 text-blue-600" />
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={copyToClipboard}
            className="flex items-center justify-end gap-2 cursor-pointer"
          >
            <span>העתק ללוח</span>
            <Copy className="h-4 w-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};

export default TaskExternalShare;