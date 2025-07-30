
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Copy, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskCommentsProps {
  taskId: string;
  comments: string[];
  onCommentsUpdate: (newComments: string[]) => void;
  attachments?: { name: string; url: string; }[];
  onAttachmentsUpdate?: (newAttachments: { name: string; url: string; }[]) => void;
}

const TaskComments = ({ 
  taskId, 
  comments, 
  onCommentsUpdate,
  attachments = [],
  onAttachmentsUpdate
}: TaskCommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const updatedComments = [...comments, newComment.trim()];
      
      const { error } = await supabase
        .from("tasks")
        .update({ comments: updatedComments })
        .eq("id", taskId);

      if (error) throw error;

      onCommentsUpdate(updatedComments);
      setNewComment("");
      
      toast({
        title: "תגובה נוספה",
        description: "התגובה נוספה בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה בהוספת תגובה",
        description: "אירעה שגיאה בעת הוספת התגובה",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (indexToDelete: number) => {
    try {
      const updatedComments = comments.filter((_, index) => index !== indexToDelete);
      
      const { error } = await supabase
        .from("tasks")
        .update({ comments: updatedComments })
        .eq("id", taskId);

      if (error) throw error;

      onCommentsUpdate(updatedComments);
      
      toast({
        title: "תגובה נמחקה",
        description: "התגובה נמחקה בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה במחיקת תגובה",
        description: "אירעה שגיאה בעת מחיקת התגובה",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "הועתק",
        description: "הלינק הועתק ללוח",
      });
    } catch (err) {
      toast({
        title: "שגיאה בהעתקה",
        description: "לא ניתן להעתיק את הלינק",
        variant: "destructive",
      });
    }
  };

  const formatTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <span key={index} className="inline-flex items-center gap-1">
            <a
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline hover:no-underline transition-colors inline-flex items-center gap-1"
            >
              {part}
              <ExternalLink className="h-3 w-3" />
            </a>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 ml-1 hover:bg-blue-100 dark:hover:bg-blue-900"
                    onClick={() => copyToClipboard(part)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>העתק לינק</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        );
      }
      return part;
    });
  };

  const formatComment = (comment: string) => {
    // Split the comment by newlines
    return comment.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for various bullet point formats:
      // - Standard bullet points (-, *, •)
      // - Numbered lists (1., 2., etc.)
      // - Unicode bullet points (•, ‣, ⁃, ⌑, ○, ●, etc.)
      // - Copy-pasted bullet points from various sources
      if (
        trimmedLine.startsWith('-') || 
        trimmedLine.startsWith('*') || 
        trimmedLine.startsWith('•') ||
        trimmedLine.startsWith('⌑') ||
        trimmedLine.startsWith('○') ||
        trimmedLine.startsWith('●') ||
        trimmedLine.startsWith('‣') ||
        trimmedLine.startsWith('⁃') ||
        /^\d+\.\s/.test(trimmedLine) // Matches numbered lists
      ) {
        // Remove the bullet point or number and any leading whitespace
        const content = trimmedLine.replace(/^[-*•⌑○●‣⁃]|\d+\.\s/, '').trim();
        return (
          <li key={index} className="list-disc mr-6">
            {formatTextWithLinks(content)}
          </li>
        );
      }
      return (
        <p key={index} className="leading-relaxed">
          {formatTextWithLinks(trimmedLine)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-4" dir="rtl">
      <ScrollArea className={`rounded-md border p-4 ${comments.length > 0 ? 'max-h-[40vh] min-h-[100px]' : 'h-[100px]'}`}>
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">אין תגובות עדיין</p>
        ) : (
          <div className="space-y-2">
            {comments.map((comment, index) => (
              <div
                key={index}
                className="bg-purple-50 dark:bg-gray-800 p-2 rounded-lg text-right group relative"
              >
                <div className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteComment(index)}
                    className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {formatComment(comment)}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      <div className="flex gap-2">
        <Button
          onClick={handleAddComment}
          className="bg-purple-600 hover:bg-purple-700"
        >
          הוסף
        </Button>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="הוסף תגובה..."
          className="flex-grow text-right"
          dir="rtl"
        />
      </div>
    </div>
  );
};

export default TaskComments;
