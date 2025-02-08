
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
            {content}
          </li>
        );
      }
      return <p key={index}>{trimmedLine}</p>;
    });
  };

  return (
    <div className="space-y-4" dir="rtl">
      <ScrollArea className="h-32 rounded-md border p-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">אין תגובות עדיין</p>
        ) : (
          <div className="space-y-2">
            {comments.map((comment, index) => (
              <div
                key={index}
                className="bg-purple-50 dark:bg-gray-800 p-2 rounded-lg text-right"
              >
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
