import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Paperclip, X, FileUp } from "lucide-react";

interface TaskAttachmentsProps {
  taskId: string;
  attachments: { name: string; url: string }[];
  onAttachmentsUpdate: (newAttachments: { name: string; url: string }[]) => void;
}

const TaskAttachments = ({ taskId, attachments, onAttachmentsUpdate }: TaskAttachmentsProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedAttachments = [...attachments];
    const failedUploads: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const filePath = `${taskId}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('task-attachments')
          .upload(filePath, file);

        if (uploadError) {
          failedUploads.push(file.name);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('task-attachments')
          .getPublicUrl(filePath);

        uploadedAttachments.push({
          name: file.name,
          url: publicUrl
        });
      }

      const { error: updateError } = await supabase
        .from('tasks')
        .update({ attachments: uploadedAttachments })
        .eq('id', taskId);

      if (updateError) throw updateError;

      onAttachmentsUpdate(uploadedAttachments);
      
      if (failedUploads.length === 0) {
        toast({
          title: "קבצים הועלו",
          description: "כל הקבצים הועלו בהצלחה",
        });
      } else {
        toast({
          title: "חלק מהקבצים לא הועלו",
          description: `הקבצים הבאים נכשלו: ${failedUploads.join(', ')}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה בהעלאת קבצים",
        description: "אירעה שגיאה בעת העלאת הקבצים",
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
          size="lg"
          className="relative w-full flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800"
          disabled={isUploading}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.txt"
            multiple
          />
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700" />
              מעלה...
            </>
          ) : (
            <>
              <FileUp className="h-4 w-4" />
              צרף קבצים
            </>
          )}
        </Button>
      </div>
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment, index) => (
            <div
              key={index}
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