import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Copy, ExternalLink, Send, MessageCircle, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
          <span key={index} className="inline-flex items-center gap-1 flex-wrap">
            <a
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary transition-all inline-flex items-center gap-1 break-all"
            >
              <span className="max-w-[200px] truncate">{part}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-primary/10 rounded-full"
                    onClick={() => copyToClipboard(part)}
                  >
                    <Copy className="h-3 w-3 text-muted-foreground" />
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
    return comment.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      
      if (
        trimmedLine.startsWith('-') || 
        trimmedLine.startsWith('*') || 
        trimmedLine.startsWith('•') ||
        trimmedLine.startsWith('⌑') ||
        trimmedLine.startsWith('○') ||
        trimmedLine.startsWith('●') ||
        trimmedLine.startsWith('‣') ||
        trimmedLine.startsWith('⁃') ||
        /^\d+\.\s/.test(trimmedLine)
      ) {
        const content = trimmedLine.replace(/^[-*•⌑○●‣⁃]|\d+\.\s/, '').trim();
        return (
          <li key={index} className="list-disc mr-6 text-foreground/90 leading-relaxed">
            {formatTextWithLinks(content)}
          </li>
        );
      }
      return (
        <p key={index} className="leading-relaxed text-foreground/90">
          {formatTextWithLinks(trimmedLine)}
        </p>
      );
    });
  };

  const formatTimeAgo = (index: number) => {
    // Simulate time ago based on index (most recent first would be index 0 from end)
    const reverseIndex = comments.length - 1 - index;
    if (reverseIndex === 0) return "עכשיו";
    if (reverseIndex < 5) return `לפני ${reverseIndex} דקות`;
    return `תגובה ${index + 1}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleAddComment();
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <MessageCircle className="h-4 w-4 text-primary" />
        <span>תגובות</span>
        {comments.length > 0 && (
          <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold">
            {comments.length}
          </span>
        )}
      </div>

      {/* Comments List */}
      <ScrollArea className={cn(
        "rounded-xl border border-border/50 bg-muted/30 backdrop-blur-sm",
        comments.length > 0 ? 'max-h-[300px] min-h-[120px]' : 'h-[100px]'
      )}>
        <div className="p-4">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[70px] text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground text-sm">אין תגובות עדיין</p>
              <p className="text-muted-foreground/60 text-xs">הוסף תגובה ראשונה למשימה</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {comments.map((comment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="group relative"
                  >
                    <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-border/30 hover:border-primary/30 hover:shadow-md transition-all duration-200">
                      {/* Comment Header */}
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-primary">{index + 1}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(index)}</span>
                          </div>
                        </div>
                        
                        {/* Delete Button */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.1 }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteComment(index)}
                                  className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-full"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>מחק תגובה</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </motion.div>
                      </div>
                      
                      {/* Comment Content */}
                      <div className="text-sm space-y-1">
                        {formatComment(comment)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Add Comment Form */}
      <div className="flex gap-2 items-end">
        <div className="flex-grow relative">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="הוסף תגובה... (Ctrl+Enter לשליחה)"
            className="min-h-[80px] resize-none text-right bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 rounded-xl pr-4 pl-4 py-3 text-sm placeholder:text-muted-foreground/50"
            dir="rtl"
          />
          <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground/50">
            Ctrl+Enter
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className={cn(
                    "h-[80px] w-12 rounded-xl transition-all duration-200",
                    newComment.trim() 
                      ? "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20" 
                      : "bg-muted"
                  )}
                >
                  <Send className={cn(
                    "h-5 w-5 transition-transform",
                    newComment.trim() && "rotate-180"
                  )} />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>שלח תגובה</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default TaskComments;
