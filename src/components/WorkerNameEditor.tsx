import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";
import { motion } from "framer-motion";

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

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxSize = 500;

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }
        }, 'image/jpeg', 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedFile = await compressImage(file);
      setAvatarFile(compressedFile);
      setPreviewUrl(URL.createObjectURL(compressedFile));
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
            .upload(filePath, avatarFile, { upsert: true });

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

      try {
        const { error } = await supabase
          .from('team_members')
          .update({ 
            name: newName.trim(),
            ...(avatarUrl && { avatar_url: avatarUrl })
          })
          .eq('worker_id', workerId);

        if (error) throw error;

        onNameChange(workerId, newName.trim(), avatarUrl);
        setIsOpen(false);
        toast({
          title: "פרטי עובד עודכנו",
          description: "פרטי העובד עודכנו בהצלחה",
        });
      } catch (error) {
        console.error('Error updating team member:', error);
        toast({
          title: "שגיאה בעדכון פרטי העובד",
          description: "אנא נסה שנית",
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 border border-primary/50 hover:border-primary transition-all duration-300 shadow-lg hover:shadow-xl"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setNewName(currentName);
            setIsOpen(true);
          }}
        >
          <Edit2 className="h-4 w-4 text-primary" />
        </motion.button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[425px] animate-in fade-in-0 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            עריכת פרטי עובד
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-6">
            <motion.div 
              className="relative group"
              whileHover={{ scale: 1.02 }}
            >
              <Avatar className="h-32 w-32 ring-2 ring-offset-2 ring-offset-background transition-all duration-300 group-hover:ring-primary shadow-lg group-hover:shadow-xl">
                <AvatarImage src={previewUrl} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                  <UserRound className="h-16 w-16 text-primary/70" />
                </AvatarFallback>
              </Avatar>
              <motion.div 
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
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
                  size="sm"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800"
                >
                  <Upload className="h-4 w-4 ml-2" />
                  העלה תמונה
                </Button>
              </motion.div>
            </motion.div>
          </div>
          <div className="space-y-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="הכנס שם עובד"
              className="text-right transition-all duration-300 focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
            >
              שמור
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="hover:bg-secondary transition-all duration-300"
            >
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkerNameEditor;
