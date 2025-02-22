
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Paperclip, X, FileUp } from "lucide-react";

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface TaskAttachmentsProps {
  taskId: string;
  attachments: Attachment[];
  onAttachmentsUpdate: (newAttachments: Attachment[]) => void;
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

      const newAttachment: Attachment = {
        id: crypto.randomUUID(),
        name: file.name,
        url: publicUrl,
        type: file.type
      };

      const updatedAttachments = [...attachments, newAttachment];
      
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
          size="lg"
          className="relative w-full flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800"
          disabled={isUploading}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700" />
              מעלה...
            </>
          ) : (
            <>
              <FileUp className="h-4 w-4" />
              צרף קובץ
            </>
          )}
        </Button>
      </div>
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment, index) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline truncate max-w-[200px] flex items-center gap-2"
              >
                <Paperclip className="h-4 w-4" />
                {attachment.name}
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAttachment(index)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
