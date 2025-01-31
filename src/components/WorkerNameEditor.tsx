import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";

interface WorkerNameEditorProps {
  currentName: string;
  currentAvatarUrl?: string;
  workerId: string;
  onNameChange: (id: string, newName: string, avatarUrl?: string) => void;
}

const WorkerNameEditor = ({ currentName, currentAvatarUrl, workerId, onNameChange }: WorkerNameEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      let avatarUrl = currentAvatarUrl;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${workerId}.${fileExt}`;

        try {
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, {
              upsert: true,
            });

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          avatarUrl = data.publicUrl;
        } catch (error) {
          console.error('Error uploading avatar:', error);
          toast({
            title: "שגיאה בהעלאת התמונה",
            description: "אנא נסה שנית",
          });
          return;
        }
      }

      onNameChange(workerId, newName.trim(), avatarUrl);
      setIsOpen(false);
      toast({
        title: "פרטי עובד עודכנו",
        description: "פרטי העובד עודכנו בהצלחה",
      });
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="h-8 w-8 rounded-full bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
          onClick={handleButtonClick}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[425px]"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>עריכת פרטי עובד</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={previewUrl} />
              <AvatarFallback>
                <UserRound className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="avatar-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                <Upload className="h-4 w-4 ml-2" />
                העלה תמונה
              </Button>
            </div>
          </div>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="הכנס שם עובד"
            className="text-right"
          />
          <div className="flex justify-end gap-2">
            <Button type="submit">שמור</Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkerNameEditor;