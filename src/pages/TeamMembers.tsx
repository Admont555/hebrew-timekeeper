import { motion } from "framer-motion";
import TeamMemberCard from "@/components/team/TeamMemberCard";
import TeamMemberManager from "@/components/team/TeamMemberManager";
import { Users, Edit2, Moon, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWorkerState } from "@/hooks/useWorkerState";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";

const TeamMembers = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const isMobile = useIsMobile();
  const { currentWorker, setCurrentWorker, hasEditPermission } = useWorkerState();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
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

  useEffect(() => {
    if (!teamMembers.length) return;
    const hasValidCurrentWorker = teamMembers.some(
      (member) => member.worker_id === currentWorker
    );
    if (!hasValidCurrentWorker) {
      setCurrentWorker(teamMembers[0].worker_id);
    }
  }, [teamMembers, currentWorker, setCurrentWorker]);

  return (
    <div className="min-h-screen bg-gradient-subtle" dir="rtl">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Top bar with theme toggle */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <img 
              src="https://beeu.co.il/wp-content/uploads/2024/03/אייקון-ביו-מקורי-1.svg" 
              alt="BeEu Logo" 
              className="w-10 h-10 object-contain"
              loading="eager"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-0">מנהל משימות</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full h-10 w-10 hover:bg-accent"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4"
          >
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">בחר חבר צוות</span>
          </motion.div>
          
          <p className="text-muted-foreground max-w-md mx-auto mb-0">
            בחר חבר צוות כדי לצפות ולנהל את המשימות שלו
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {hasEditPermission(currentWorker) && (
              <TeamMemberManager onMemberAdded={refetch} />
            )}
            <Button
              variant={isEditMode ? "destructive" : "outline"}
              onClick={() => setIsEditMode(!isEditMode)}
              className="gap-2"
              size={isMobile ? "sm" : "default"}
              disabled={!hasEditPermission(currentWorker)}
            >
              <Edit2 className="h-4 w-4" />
              {isEditMode ? "סיום עריכה" : "ערוך חברי צוות"}
            </Button>
          </div>
        </motion.div>

        {/* Team grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.08 }}
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
