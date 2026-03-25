import { motion } from "framer-motion";
import TeamMemberCard from "@/components/team/TeamMemberCard";
import TeamMemberManager from "@/components/team/TeamMemberManager";
import { Users, Edit2, BarChart, ListChecks } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NavMenu } from "@/components/NavMenu";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkerState } from "@/hooks/useWorkerState";
import { useToast } from "@/hooks/use-toast";

const TeamMembers = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const isMobile = useIsMobile();
  const { currentWorker, setCurrentWorker, hasEditPermission } = useWorkerState();
  const { toast } = useToast();
  
  const { data: teamMembers = [], refetch } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: tasksStats = { total: 0, completed: 0 } } = useQuery({
    queryKey: ['tasks-stats'],
    queryFn: async () => {
      const { count: total, error: totalError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });

      const { count: completed, error: completedError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('completed', true);

      if (totalError || completedError) throw totalError || completedError;
      return { total: total || 0, completed: completed || 0 };
    },
  });

  const completionPercentage = tasksStats.total > 0 
    ? Math.round((tasksStats.completed / tasksStats.total) * 100) 
    : 0;

  useEffect(() => {
    if (!teamMembers.length) return;

    const hasValidCurrentWorker = teamMembers.some(
      (member) => member.worker_id === currentWorker
    );

    if (!hasValidCurrentWorker) {
      setCurrentWorker(teamMembers[0].worker_id);
      toast({
        title: "חשבון ברירת מחדל שוחזר",
        description: "בחרנו עבורך משתמש קיים כדי שתוכל להמשיך לערוך ולעבוד רגיל.",
      });
    }
  }, [teamMembers, currentWorker, setCurrentWorker, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/80 via-white to-purple-50/80 dark:from-gray-900 dark:via-gray-800/90 dark:to-gray-900">
      <NavMenu />
      <div className={`container mx-auto px-4 py-8 md:py-12 ${isMobile ? 'pt-16' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`text-center mb-8 md:mb-12 ${isMobile ? 'mt-6' : ''}`}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Users className="h-8 w-8 md:h-10 md:w-10 text-primary bg-primary/10 p-2 rounded-full" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">צוות העבודה שלנו</h1>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mb-8 max-w-lg mx-auto px-2"
          >
            ברוכים הבאים למערכת ניהול המשימות. בחר חבר צוות כדי לצפות ולנהל את המשימות שלו.
            {currentWorker && (
              <span className="block mt-2 font-medium text-primary">
                מחובר כ: {teamMembers.find(m => m.worker_id === currentWorker)?.name || currentWorker}
              </span>
            )}
          </motion.p>

          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8">
            {hasEditPermission(currentWorker) && (
              <TeamMemberManager 
                onMemberAdded={refetch}
              />
            )}
            <Button
              variant={isEditMode ? "destructive" : "outline"}
              onClick={() => setIsEditMode(!isEditMode)}
              className="gap-2 h-10 md:h-auto text-sm md:text-base"
              size={isMobile ? "sm" : "default"}
              disabled={!hasEditPermission(currentWorker)}
            >
              <Edit2 className="h-4 w-4" />
              {isEditMode ? "סיום עריכה" : "ערוך חברי צוות"}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowDuplicateResolver(!showDuplicateResolver)}
              className="gap-2 h-10 md:h-auto text-sm md:text-base"
              size={isMobile ? "sm" : "default"}
            >
              <AlertTriangle className="h-4 w-4" />
              {showDuplicateResolver ? "הסתר" : "בדוק כפילויות"}
            </Button>
          </div>
        </motion.div>

        {showDuplicateResolver && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <DuplicateResolver />
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto"
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <TeamMemberCard
                id={member.id}
                workerId={member.worker_id}
                name={member.name}
                avatarUrl={member.avatar_url}
                isEditMode={isEditMode && hasEditPermission(currentWorker)}
                onDelete={refetch}
                isCurrentWorker={member.worker_id === currentWorker}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TeamMembers;
