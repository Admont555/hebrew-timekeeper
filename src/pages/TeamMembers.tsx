import { motion } from "framer-motion";
import TeamMemberCard from "@/components/team/TeamMemberCard";
import TeamMemberManager from "@/components/team/TeamMemberManager";
import { Users, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NavMenu } from "@/components/NavMenu";

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavMenu />
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">צוות העבודה שלנו</h1>
          </div>
          <p className="text-muted-foreground mb-6">בחר חבר צוות כדי לצפות במשימות שלו</p>
          <div className="flex justify-center gap-4">
            <TeamMemberManager 
              onMemberAdded={refetch}
            />
            <Button
              variant={isEditMode ? "destructive" : "outline"}
              onClick={() => setIsEditMode(!isEditMode)}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              {isEditMode ? "סיום עריכה" : "ערוך חברי צוות"}
            </Button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {teamMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              id={member.worker_id}
              name={member.name}
              avatarUrl={member.avatar_url}
              isEditMode={isEditMode}
              onDelete={refetch}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TeamMembers;