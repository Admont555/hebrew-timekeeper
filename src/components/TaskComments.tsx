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
}

const TaskComments = ({ 
  taskId, 
  comments, 
  onCommentsUpdate,
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

  return (
    <div className="space-y-4">
      <ScrollArea className="h-32 rounded-md border p-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-right">אין תגובות עדיין</p>
        ) : (
          <div className="space-y-2">
            {comments.map((comment, index) => (
              <div
                key={index}
                className="bg-purple-50 dark:bg-gray-800 p-2 rounded-lg text-right"
              >
                {comment}
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
