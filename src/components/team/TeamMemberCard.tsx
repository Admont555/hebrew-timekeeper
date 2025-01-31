import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface TeamMemberCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
}

const TeamMemberCard = ({ id, name, avatarUrl }: TeamMemberCardProps) => {
  return (
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
          <h3 className="text-xl font-semibold text-center">{name}</h3>
        </Card>
      </motion.div>
    </Link>
  );
};

export default TeamMemberCard;