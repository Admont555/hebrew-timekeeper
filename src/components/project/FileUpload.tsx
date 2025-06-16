
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, File } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface FileUploadProps {
  projectId: string;
  onFilesUpdated: () => void;
}

const FileUpload = ({ projectId, onFilesUpdated }: FileUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}/${Date.now()}_${file.name}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Save file metadata to database
        const { error: dbError } = await supabase
          .from('project_files')
          .insert([
            {
              project_id: projectId,
              file_name: file.name,
              file_path: fileName,
              file_size: file.size,
              file_type: file.type,
              uploaded_by: 'current_user', // We'll replace this with actual user data when auth is implemented
            },
          ]);

        if (dbError) throw dbError;

        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      toast({
        title: "קבצים הועלו בהצלחה",
        description: `${selectedFiles.length} קבצים הועלו לפרויקט`,
      });

      setSelectedFiles([]);
      setIsOpen(false);
      onFilesUpdated();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהעלאת הקבצים",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 ml-2" />
          העלאת קבצים
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>העלאת קבצים לפרויקט</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <File className="h-4 w-4 ml-2" />
              בחר קבצים
            </Button>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">קבצים נבחרים:</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    <div className="flex justify-between items-center">
                      <span>{file.name}</span>
                      <span className="text-gray-500">
                        {Math.round(file.size / 1024)} KB
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>מעלה קבצים...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>
              ביטול
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
            >
              {isUploading ? "מעלה..." : "העלה קבצים"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUpload;
