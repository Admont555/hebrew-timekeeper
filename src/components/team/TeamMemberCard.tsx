import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { UserRound, XOctagon, AlertOctagon, CheckCircle, Lock } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWorkerState } from "@/hooks/useWorkerState";

interface TeamMemberCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
  isEditMode: boolean;
  onDelete: () => void;
  workerId: string;
  isCurrentWorker?: boolean;
}

const TeamMemberCard = ({ 
  id, 
  name: initialName, 
  avatarUrl: initialAvatarUrl, 
  isEditMode, 
  onDelete,
  workerId,
  isCurrentWorker = false
}: TeamMemberCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasEditPermission } = useWorkerState();
  
  const canEdit = hasEditPermission(workerId);

  const { data: tasksData = { open: 0, completed: 0 } } = useQuery({
    queryKey: ['tasks-summary', workerId],
    queryFn: async () => {
      const { count: open, error: openError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('worker', workerId)
        .eq('completed', false);

      const { count: completed, error: completedError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('worker', workerId)
        .eq('completed', true);

      if (openError || completedError) throw openError || completedError;
      return { open: open || 0, completed: completed || 0 };
    },
  });

  const handleNameChange = async (workerId: string, newName: string, newAvatarUrl?: string) => {
    if (!canEdit) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה לערוך פרטי עובד זה",
        variant: "destructive",
      });
      return;
    }
    
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
      
      toast({
        title: "פרטי עובד עודכנו",
        description: "הפרטים עודכנו בהצלחה",
      });
    } catch (error) {
      console.error('Error updating team member:', error);
      toast({
        title: "שגיאה בעדכון פרטי עובד",
        description: "אירעה שגיאה בעדכון הפרטים",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!canEdit) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה למחוק עובד זה",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('=== ATTEMPTING TO DELETE TEAM MEMBER ===');
      console.log('Member ID:', id);
      console.log('Member Name:', name);
      console.log('Worker ID:', workerId);
      console.log('Current Worker:', isCurrentWorker);
      
      // First, check if member has any tasks
      const { count: taskCount, error: taskCountError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('worker', workerId);

      if (taskCountError) {
        console.error('Error checking tasks:', taskCountError);
        throw new Error(`שגיאה בבדיקת משימות: ${taskCountError.message}`);
      }

      console.log(`Member has ${taskCount} tasks`);

      if (taskCount && taskCount > 0) {
        throw new Error(`לא ניתן למחוק את ${name} כי יש לו ${taskCount} משימות פעילות`);
      }

      // Check if member is referenced in other tables
      const { count: timeLogCount, error: timeLogError } = await supabase
        .from('time_logs')
        .select('*', { count: 'exact', head: true })
        .eq('worker', workerId);

      if (timeLogError) {
        console.error('Error checking time logs:', timeLogError);
      } else {
        console.log(`Member has ${timeLogCount} time logs`);
      }

      // Check if member is assigned to tasks
      const { count: assignedTaskCount, error: assignedError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .contains('assigned_to', [workerId]);

      if (assignedError) {
        console.error('Error checking assigned tasks:', assignedError);
      } else {
        console.log(`Member is assigned to ${assignedTaskCount} tasks`);
      }

      // Try to delete by ID first
      console.log('Attempting delete by ID...');
      const { error: deleteByIdError } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (deleteByIdError) {
        console.error('Delete by ID failed:', deleteByIdError);
        
        // Try to delete by worker_id
        console.log('Attempting delete by worker_id...');
        const { error: deleteByWorkerError } = await supabase
          .from('team_members')
          .delete()
          .eq('worker_id', workerId);

        if (deleteByWorkerError) {
          console.error('Delete by worker_id also failed:', deleteByWorkerError);
          throw new Error(`שגיאה במחיקת העובד: ${deleteByWorkerError.message}`);
        }
      }

      console.log('Successfully deleted member:', name);
      
      toast({
        title: "חבר צוות נמחק",
        description: `${name} נמחק בהצלחה`,
      });
      
      onDelete();
    } catch (error: any) {
      console.error('=== DELETE ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      toast({
        title: "שגיאה במחיקת חבר צוות",
        description: error.message || `לא ניתן למחוק את ${name}`,
        variant: "destructive",
      });
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if not in edit mode and if the click wasn't on a button or editor
    if (!isEditMode && 
        e.target instanceof Element && 
        !e.target.closest('button') && 
        !e.target.closest('[data-prevent-navigation="true"]')) {
      navigate(`/member/${workerId}`);
    }
  };

  // Calculate completion percentage
  const totalTasks = tasksData.open + tasksData.completed;
  const completionPercentage = totalTasks > 0 
    ? Math.round((tasksData.completed / totalTasks) * 100) 
    : 0;

  return (
    <motion.div 
      className="relative group"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className="cursor-pointer"
        onClick={handleCardClick}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`p-6 flex flex-col items-center gap-4 overflow-hidden relative
          ${isEditMode 
            ? 'border-red-500/50 dark:border-red-500/30 shadow-lg shadow-red-500/10' 
            : isCurrentWorker
              ? 'border-green-500/50 dark:border-green-500/30 shadow-lg shadow-green-500/10'
              : 'border-purple-100/50 dark:border-purple-800/30 shadow-lg hover:shadow-xl dark:shadow-gray-900/20'
          } 
          before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/80 before:via-white/70 
          ${isCurrentWorker 
            ? 'before:to-green-50/40 before:dark:from-gray-800/80 before:dark:via-gray-800/70 before:dark:to-green-900/10' 
            : 'before:to-purple-50/40 before:dark:from-gray-800/80 before:dark:via-gray-800/70 before:dark:to-purple-900/10'} 
          before:backdrop-blur-sm before:z-0
        `}>
          
          {/* Debug info badge for this specific member */}
          <div className="absolute top-2 left-2 z-20 text-xs bg-black/50 text-white p-1 rounded">
            ID: {id.slice(-8)}
          </div>
          
          {/* Edit mode indicator */}
          {isEditMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 right-2 z-20"
            >
              {canEdit ? (
                <AlertOctagon className="text-red-500/70 h-5 w-5 animate-pulse" />
              ) : (
                <Lock className="text-gray-500/70 h-5 w-5" />
              )}
            </motion.div>
          )}
          
          {/* Current user indicator */}
          {isCurrentWorker && !isEditMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 right-2 z-20"
            >
              <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
                עובד נוכחי
              </Badge>
            </motion.div>
          )}
          
          {/* Avatar section */}
          <div className="relative z-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative"
            >
              <div className={`absolute inset-0 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity 
                ${isCurrentWorker 
                  ? 'bg-gradient-to-br from-green-300 to-blue-300 dark:from-green-600 dark:to-blue-600' 
                  : 'bg-gradient-to-br from-purple-300 to-blue-300 dark:from-purple-600 dark:to-blue-600'
                }`}></div>
              <Avatar className={`h-24 w-24 ring-2 ring-offset-2 ring-offset-background 
                ${isCurrentWorker 
                  ? 'ring-green-200 dark:ring-green-800' 
                  : 'ring-purple-200 dark:ring-purple-800'
                } 
                transition-all duration-300 group-hover:ring-primary shadow-lg group-hover:shadow-xl`}>
                <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                <AvatarFallback className={`
                  ${isCurrentWorker 
                    ? 'bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900' 
                    : 'bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900'
                  }`}>
                  <UserRound className="h-12 w-12 text-primary/70" />
                </AvatarFallback>
              </Avatar>
            </motion.div>
            
            {/* Task badges */}
            <div className="absolute -top-2 -right-2 flex flex-col gap-1 items-end">
              {tasksData.open > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Badge 
                    variant="destructive"
                    className="animate-pulse shadow-lg"
                  >
                    {tasksData.open} פתוחות
                  </Badge>
                </motion.div>
              )}
              
              {tasksData.completed > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.1 }}
                >
                  <Badge 
                    className="bg-green-500 hover:bg-green-600 shadow-lg"
                  >
                    {tasksData.completed} הושלמו
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Name and stats */}
          <motion.div 
            className="flex flex-col items-center gap-2 z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl font-semibold text-center bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              {name}
            </h3>
            
            {/* Task progress bar */}
            {totalTasks > 0 && (
              <div className="w-full mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>התקדמות</span>
                  <span>{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Completion checkmark for 100% */}
            {completionPercentage === 100 && totalTasks > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="mt-1"
              >
                <CheckCircle className="h-5 w-5 text-green-500" />
              </motion.div>
            )}
          </motion.div>
        </Card>
      </motion.div>
      
      {/* Edit controls */}
      {isEditMode && (
        <>
          {canEdit ? (
            <>
              <motion.div 
                className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                data-prevent-navigation="true"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <WorkerNameEditor
                          currentName={name}
                          currentAvatarUrl={avatarUrl}
                          workerId={workerId}
                          onNameChange={handleNameChange}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>ערוך פרטי עובד</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                className="absolute top-6 left-6 p-2 rounded-full bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 border border-red-500/50 hover:border-red-700 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg hover:shadow-xl z-20"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <XOctagon className="h-4 w-4 text-red-500" />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>מחק עובד - {name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.button>
            </>
          ) : (
            <motion.div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-3 rounded-full bg-black/40 dark:bg-white/10 backdrop-blur-sm">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>אין לך הרשאה לערוך עובד זה</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          )}
        </>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח שברצונך למחוק את {name}?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו היא בלתי הפיכה. חבר הצוות יימחק לצמיתות.
              <br /><br />
              <strong>פרטי העובד:</strong>
              <br />Worker ID: {workerId}
              <br />משימות פתוחות: {tasksData.open}
              <br />משימות שהושלמו: {tasksData.completed}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              מחק את {name}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default TeamMemberCard;
