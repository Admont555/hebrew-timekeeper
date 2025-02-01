import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Paperclip, X } from "lucide-react";

interface TaskAttachmentsProps {
  taskId: string;
  attachments: { name: string; url: string }[];
  onAttachmentsUpdate: (newAttachments: { name: string; url: string }[]) => void;
}

const TaskAttachments = ({ taskId, attachments, onAttachmentsUpdate }: TaskAttachmentsProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${taskId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(filePath);

      const newAttachment = {
        name: file.name,
        url: publicUrl
      };

      const updatedAttachments = [...attachments, newAttachment];
      
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ attachments: updatedAttachments })
        .eq('id', taskId);

      if (updateError) throw updateError;

      onAttachmentsUpdate(updatedAttachments);
      
      toast({
        title: "קובץ הועלה",
        description: "הקובץ הועלה בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה בהעלאת קובץ",
        description: "אירעה שגיאה בעת העלאת הקובץ",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = async (index: number) => {
    try {
      const updatedAttachments = attachments.filter((_, i) => i !== index);
      
      const { error } = await supabase
        .from('tasks')
        .update({ attachments: updatedAttachments })
        .eq('id', taskId);

      if (error) throw error;

      onAttachmentsUpdate(updatedAttachments);
      
      toast({
        title: "קובץ הוסר",
        description: "הקובץ הוסר בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה בהסרת קובץ",
        description: "אירעה שגיאה בעת הסרת הקובץ",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="relative"
          disabled={isUploading}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <Paperclip className="h-4 w-4 mr-2" />
          {isUploading ? 'מעלה...' : 'צרף קובץ'}
        </Button>
      </div>
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
            >
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline truncate max-w-[200px]"
              >
                {attachment.name}
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAttachment(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskAttachments;