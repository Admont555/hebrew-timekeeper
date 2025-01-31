import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { UserRound, XOctagon, AlertOctagon } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import WorkerNameEditor from "@/components/WorkerNameEditor";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";

interface TeamMemberCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
  isEditMode: boolean;
  onDelete: () => void;
  workerId: string;
}

const TeamMemberCard = ({ 
  id, 
  name: initialName, 
  avatarUrl: initialAvatarUrl, 
  isEditMode, 
  onDelete,
  workerId 
}: TeamMemberCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: openTasksCount = 0 } = useQuery({
    queryKey: ['open-tasks', workerId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('worker', workerId)
        .eq('completed', false);

      if (error) throw error;
      return count || 0;
    },
  });

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
        .eq('worker_id', workerId);

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

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if not in edit mode and if the click wasn't on a button or editor
    if (!isEditMode && 
        e.target instanceof Element && 
        !e.target.closest('button') && 
        !e.target.closest('[data-prevent-navigation="true"]')) {
      e.preventDefault();
      e.stopPropagation();
      navigate(`/member/${workerId}`);
    }
  };

  return (
    <div className="relative group">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
        onClick={handleCardClick}
      >
        <Card className={`p-6 flex flex-col items-center gap-4 bg-gradient-to-br from-white/90 via-white/80 to-white/70 dark:from-gray-800/90 dark:via-gray-800/80 dark:to-gray-800/70 backdrop-blur-sm border-2 transition-all duration-300 ${
          isEditMode 
            ? 'border-red-500/50 dark:border-red-500/30 shadow-lg shadow-red-500/10' 
            : 'border-transparent hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5'
        }`}>
          {isEditMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 right-2"
            >
              <AlertOctagon className="text-red-500/70 h-5 w-5 animate-pulse" />
            </motion.div>
          )}
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Avatar className="h-24 w-24 ring-2 ring-offset-2 ring-offset-background transition-all duration-300 group-hover:ring-primary shadow-lg group-hover:shadow-xl">
                <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                  <UserRound className="h-12 w-12 text-primary/70" />
                </AvatarFallback>
              </Avatar>
            </motion.div>
            {openTasksCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Badge 
                  variant="destructive"
                  className="absolute -top-2 -right-2 animate-bounce shadow-lg"
                >
                  {openTasksCount}
                </Badge>
              </motion.div>
            )}
          </div>
          <motion.div 
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl font-semibold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {name}
            </h3>
            {openTasksCount > 0 && (
              <span className="text-sm text-muted-foreground animate-pulse">
                {openTasksCount} משימות פתוחות
              </span>
            )}
          </motion.div>
        </Card>
      </motion.div>
      
      {isEditMode && (
        <>
          <motion.div 
            className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            data-prevent-navigation="true"
          >
            <WorkerNameEditor
              currentName={name}
              currentAvatarUrl={avatarUrl}
              workerId={workerId}
              onNameChange={handleNameChange}
            />
          </motion.div>
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            className="absolute top-6 left-6 p-2 rounded-full bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 border border-red-500/50 hover:border-red-700 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg hover:shadow-xl"
          >
            <XOctagon className="h-4 w-4 text-red-500" />
          </motion.button>
        </>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח שברצונך למחוק את חבר הצוות?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו היא בלתי הפיכה. חבר הצוות יימחק לצמיתות.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamMemberCard;