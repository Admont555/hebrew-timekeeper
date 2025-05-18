
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TaskShareProps {
  taskId: string;
  currentAssignees: string[];
  onAssigneesUpdate: (newAssignees: string[]) => void;
}

interface TeamMember {
  worker_id: string;
  name: string;
  avatar_url?: string;
}

const TaskShare = ({ taskId, currentAssignees, onAssigneesUpdate }: TaskShareProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as TeamMember[];
    },
  });

  const handleShare = async (workerId: string, checked: boolean) => {
    setIsUpdating(true);
    try {
      let newAssignees = [...currentAssignees];
      
      if (checked && !newAssignees.includes(workerId)) {
        newAssignees.push(workerId);
      } else if (!checked) {
        newAssignees = newAssignees.filter(id => id !== workerId);
      }

      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: newAssignees })
        .eq('id', taskId);

      if (error) throw error;

      onAssigneesUpdate(newAssignees);
      toast({
        title: checked ? "משימה שותפה" : "שיתוף משימה בוטל",
        description: checked ? "המשימה שותפה בהצלחה" : "שיתוף המשימה בוטל בהצלחה",
      });
    } catch (error) {
      console.error('Error sharing task:', error);
      toast({
        title: "שגיאה בשיתוף המשימה",
        description: "אירעה שגיאה בעת שיתוף המשימה",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200"
        >
          <Share2 className="h-4 w-4 text-purple-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60" align="end">
        <div className="space-y-4">
          <h4 className="font-medium text-right">שתף עם</h4>
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-sm text-gray-500 text-right">טוען...</div>
            ) : teamMembers?.map((member) => (
              <div
                key={member.worker_id}
                className="flex items-center justify-end space-x-2 space-x-reverse"
              >
                <label
                  htmlFor={`share-${member.worker_id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {member.name}
                </label>
                <Checkbox
                  id={`share-${member.worker_id}`}
                  disabled={isUpdating}
                  checked={currentAssignees.includes(member.worker_id)}
                  onCheckedChange={(checked) => handleShare(member.worker_id, checked as boolean)}
                />
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TaskShare;
