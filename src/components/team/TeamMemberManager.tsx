import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamMemberManagerProps {
  onMemberAdded: () => void;
}

const TeamMemberManager = ({ onMemberAdded }: TeamMemberManagerProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  return (
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
  );
};

export default TeamMemberManager;