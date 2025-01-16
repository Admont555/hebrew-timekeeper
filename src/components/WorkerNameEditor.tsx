import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit2 } from "lucide-react";

interface WorkerNameEditorProps {
  currentName: string;
  workerId: string;
  onNameChange: (id: string, newName: string) => void;
}

const WorkerNameEditor = ({ currentName, workerId, onNameChange }: WorkerNameEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onNameChange(workerId, newName.trim());
      setIsOpen(false);
      toast({
        title: "שם עודכן",
        description: "שם העובד עודכן בהצלחה",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-accent hover:text-accent-foreground p-0"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>עריכת שם עובד</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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