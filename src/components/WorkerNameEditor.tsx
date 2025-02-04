import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface WorkerNameEditorProps {
  currentName: string;
  currentAvatarUrl?: string;
  workerId: string;
  onNameChange: (workerId: string, newName: string, newAvatarUrl?: string) => Promise<void>;
}

const WorkerNameEditor = ({
  currentName,
  currentAvatarUrl,
  workerId,
  onNameChange,
}: WorkerNameEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newName !== currentName) {
      setIsLoading(true);
      try {
        await onNameChange(workerId, newName.trim());
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating name:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={currentAvatarUrl} alt={currentName} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{currentName}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="ml-2"
        >
          ערוך
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        className="max-w-[200px]"
        placeholder="שם חדש"
      />
      <Button type="submit" disabled={isLoading || !newName.trim() || newName === currentName}>
        {isLoading ? 'שומר...' : 'שמור'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setNewName(currentName);
          setIsEditing(false);
        }}
      >
        ביטול
      </Button>
    </form>
  );
};

export default WorkerNameEditor;