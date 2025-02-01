import { motion } from "framer-motion";
import TeamMemberCard from "@/components/team/TeamMemberCard";
import TeamMemberManager from "@/components/team/TeamMemberManager";
import { Users, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NavMenu } from "@/components/NavMenu";
import { AppSidebar } from "@/components/AppSidebar";

const TeamMembers = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  
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

  return (
    <>
      <AppSidebar />
      <main className="flex-1 p-8">
        <NavMenu />
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center p-2 mb-6 rounded-full bg-purple-100 dark:bg-purple-900/30"
            >
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-4">
              צוות העבודה שלנו
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              בחר חבר צוות כדי לצפות במשימות שלו
            </p>
            <div className="flex justify-center gap-4">
              <TeamMemberManager onMemberAdded={refetch} />
              <Button
                variant={isEditMode ? "destructive" : "outline"}
                onClick={() => setIsEditMode(!isEditMode)}
                className="gap-2 hover:scale-105 transition-transform"
              >
                <Edit2 className="h-4 w-4" />
                {isEditMode ? "סיום עריכה" : "ערוך חברי צוות"}
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4"
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.4 }}
              >
                <TeamMemberCard
                  id={member.id}
                  workerId={member.worker_id}
                  name={member.name}
                  avatarUrl={member.avatar_url}
                  isEditMode={isEditMode}
                  onDelete={refetch}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default TeamMembers;