
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Upload, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

interface TeamMemberManagerProps {
  onMemberAdded: () => void;
}

const TeamMemberManager = ({ onMemberAdded }: TeamMemberManagerProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      toast({
        title: "שם חבר צוות נדרש",
        description: "אנא הכנס שם לחבר הצוות",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      let avatarUrl = null;
      
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      const workerId = `worker${Date.now()}`;
      const { error } = await supabase
        .from('team_members')
        .insert({
          name: newMemberName,
          worker_id: workerId,
          avatar_url: avatarUrl
        });

      if (error) throw error;

      setIsAddOpen(false);
      setNewMemberName("");
      setSelectedFile(null);
      onMemberAdded();
      
      toast({
        title: "חבר צוות נוסף",
        description: "חבר הצוות נוסף בהצלחה",
      });
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת חבר הצוות",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant="default"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            <UserPlus className="h-4 w-4" />
            הוסף חבר צוות
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">הוספת חבר צוות חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddMember} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">שם חבר הצוות</label>
            <Input
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="הכנס שם חבר צוות"
              className="text-right"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">תמונת פרופיל</label>
            <div className="flex flex-col gap-4">
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">בחר תמונת פרופיל</span>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            
              {selectedFile && (
                <div className="flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-blue-300 dark:from-purple-600 dark:to-blue-600 rounded-full blur-lg opacity-30"></div>
                    <Avatar className="h-20 w-20 ring-2 ring-purple-200 dark:ring-purple-800 ring-offset-2 ring-offset-background shadow-lg">
                      <AvatarImage src={URL.createObjectURL(selectedFile)} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900">
                        <User className="h-10 w-10 text-primary/70" />
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsAddOpen(false)}
              disabled={isUploading}
            >
              ביטול
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading} 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isUploading ? "מוסיף..." : "הוסף"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberManager;
