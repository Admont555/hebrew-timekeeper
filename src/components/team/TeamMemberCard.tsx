import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { UserRound, XOctagon, AlertOctagon } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import WorkerNameEditor from "@/components/WorkerNameEditor";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TeamMemberCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
  isEditMode: boolean;
  onDelete: () => void;
}

const TeamMemberCard = ({ id, name: initialName, avatarUrl: initialAvatarUrl, isEditMode, onDelete }: TeamMemberCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const { toast } = useToast();

  const handleNameChange = async (workerId: string, newName: string, newAvatarUrl?: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ 
          name: newName,
          ...(newAvatarUrl && { avatar_url: newAvatarUrl })
        })
        .eq('worker_id', workerId);

      if (error) throw error;
      
      // Update local state to reflect changes immediately
      setName(newName);
      if (newAvatarUrl) {
        setAvatarUrl(newAvatarUrl);
      }
    } catch (error) {
      console.error('Error updating team member:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('worker_id', id);

      if (error) throw error;
      
      toast({
        title: "חבר צוות נמחק",
        description: "חבר הצוות נמחק בהצלחה",
      });
      
      onDelete();
    } catch (error) {
      console.error('Error deleting team member:', error);
    }
  };

  return (
    <div className="relative">
      <Link to={isEditMode ? "#" : `/member/${id}`}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer"
        >
          <Card className={`p-6 flex flex-col items-center gap-4 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 hover:shadow-xl transition-shadow duration-300 ${
            isEditMode ? 'border-red-500 border-2' : ''
          }`}>
            {isEditMode && (
              <AlertOctagon className="absolute top-2 right-2 text-red-500 h-5 w-5" />
            )}
            <Avatar className="h-24 w-24 relative">
              <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
              <AvatarFallback>
                <UserRound className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-center">{name}</h3>
            </div>
          </Card>
        </motion.div>
      </Link>
      
      {isEditMode && (
        <>
          <div 
            className="absolute top-6 right-6"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <WorkerNameEditor
              currentName={name}
              currentAvatarUrl={avatarUrl}
              workerId={id}
              onNameChange={handleNameChange}
            />
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            className="absolute top-6 left-6 p-2 rounded-full bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 border border-red-500 hover:border-red-700 transition-colors"
          >
            <XOctagon className="h-4 w-4 text-red-500" />
          </button>
        </>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח שברצונך למחוק את חבר הצוות?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו היא בלתי הפיכה. חבר הצוות יימחק לצמיתות.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamMemberCard;