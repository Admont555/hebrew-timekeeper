import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import WorkerNameEditor from "@/components/WorkerNameEditor";
import { supabase } from "@/integrations/supabase/client";

interface TeamMemberCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
}

const TeamMemberCard = ({ id, name, avatarUrl }: TeamMemberCardProps) => {
  const handleNameChange = async (workerId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ name: newName })
        .eq('worker_id', workerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating team member name:', error);
    }
  };

  return (
    <div className="relative">
      <Link to={`/member/${id}`}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer"
        >
          <Card className="p-6 flex flex-col items-center gap-4 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 hover:shadow-xl transition-shadow duration-300">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt={name} />
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
      <div 
        className="absolute top-6 right-6"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <WorkerNameEditor
          currentName={name}
          workerId={id}
          onNameChange={handleNameChange}
        />
      </div>
    </div>
  );
};

export default TeamMemberCard;