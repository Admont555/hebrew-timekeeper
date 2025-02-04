import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WorkerNameEditorProps {
  workerId: string;
  name: string;
  avatarUrl?: string;
  onNameChange: (workerId: string, newName: string, newAvatarUrl?: string) => Promise<void>;
}

const WorkerNameEditor = ({ workerId, name: initialName, avatarUrl: initialAvatarUrl, onNameChange }: WorkerNameEditorProps) => {
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await onNameChange(workerId, name, avatarUrl);
      toast({
        title: "שינוי שם",
        description: "השם עודכן בהצלחה",
      });
    } catch (error) {
      console.error("Error updating name:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את השם",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="הכנס שם חדש"
        className="flex-grow"
      />
      <Input
        type="text"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        placeholder="הכנס URL לתמונה"
        className="flex-grow"
      />
      <Button onClick={handleSave}>שמור</Button>
    </div>
  );
};

export default WorkerNameEditor;
