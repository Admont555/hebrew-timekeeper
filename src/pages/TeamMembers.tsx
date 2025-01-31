import { motion } from "framer-motion";
import TeamMemberCard from "@/components/team/TeamMemberCard";
import { Users } from "lucide-react";

const TeamMembers = () => {
  const teamMembers = [
    { id: "worker1", name: "עובד 1" },
    { id: "worker2", name: "עובד 2" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
          <p className="text-muted-foreground">בחר חבר צוות כדי לצפות במשימות שלו</p>
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
              id={member.id}
              name={member.name}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TeamMembers;