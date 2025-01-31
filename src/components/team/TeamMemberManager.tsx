import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, UserMinus, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamMemberManagerProps {
  onMemberAdded: () => void;
  onMemberDeleted: () => void;
}

const TeamMemberManager = ({ onMemberAdded, onMemberDeleted }: TeamMemberManagerProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [memberToDelete, setMemberToDelete] = useState("");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

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
    }
  };

  const handleDeleteMember = async (workerId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('worker_id', workerId);

      if (error) throw error;

      setIsDeleteOpen(false);
      setMemberToDelete("");
      onMemberDeleted();
      
      toast({
        title: "חבר צוות הוסר",
        description: "חבר הצוות הוסר בהצלחה",
      });
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהסרת חבר הצוות",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            הוסף חבר צוות
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוספת חבר צוות חדש</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4">
            <Input
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="שם חבר הצוות"
              className="text-right"
            />
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-right"
              />
              <Upload className="h-4 w-4" />
            </div>
            {selectedFile && (
              <Avatar className="h-16 w-16 mx-auto">
                <AvatarImage src={URL.createObjectURL(selectedFile)} />
                <AvatarFallback>תמונה</AvatarFallback>
              </Avatar>
            )}
            <div className="flex justify-end gap-2">
              <Button type="submit">הוסף</Button>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                ביטול
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <UserMinus className="h-4 w-4" />
            הסר חבר צוות
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הסרת חבר צוות</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={memberToDelete}
              onChange={(e) => setMemberToDelete(e.target.value)}
              placeholder="מזהה חבר הצוות"
              className="text-right"
            />
            <div className="flex justify-end gap-2">
              <Button 
                onClick={() => handleDeleteMember(memberToDelete)}
                variant="destructive"
              >
                הסר
              </Button>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                ביטול
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamMemberManager;