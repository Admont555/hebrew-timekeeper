
import { motion } from "framer-motion";
import TeamMemberCard from "@/components/team/TeamMemberCard";
import TeamMemberManager from "@/components/team/TeamMemberManager";
import { Users, Edit2, BarChart, ListChecks } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NavMenu } from "@/components/NavMenu";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TeamMembers = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const isMobile = useIsMobile();
  
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/80 via-white to-purple-50/80 dark:from-gray-900 dark:via-gray-800/90 dark:to-gray-900 bg-fixed">
      <NavMenu />
      <div className={`container mx-auto px-4 py-8 md:py-12 ${isMobile ? 'pt-16' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`text-center mb-12 ${isMobile ? 'mt-6' : ''}`}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Users className="h-10 w-10 text-primary bg-primary/10 p-2 rounded-full" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">צוות העבודה שלנו</h1>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mb-8 max-w-lg mx-auto"
          >
            ברוכים הבאים למערכת ניהול המשימות. בחר חבר צוות כדי לצפות ולנהל את המשימות שלו.
          </motion.p>

          {/* Dashboard summary cards */}
          {isMobile ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-md mx-auto mb-8"
            >
              <Tabs defaultValue="team" className="w-full">
                <TabsList className="grid grid-cols-3 mb-2">
                  <TabsTrigger value="team" className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">צוות</span>
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="flex items-center gap-1">
                    <ListChecks className="h-4 w-4" />
                    <span className="hidden sm:inline">משימות</span>
                  </TabsTrigger>
                  <TabsTrigger value="progress" className="flex items-center gap-1">
                    <BarChart className="h-4 w-4" />
                    <span className="hidden sm:inline">התקדמות</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="team" className="mt-2">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow p-4 border border-purple-100 dark:border-gray-700">
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                        <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{teamMembers.length}</h3>
                      <p className="text-muted-foreground">חברי צוות</p>
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="tasks" className="mt-2">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow p-4 border border-purple-100 dark:border-gray-700">
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                        <ListChecks className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">{tasksStats.total}</h3>
                      <p className="text-muted-foreground">סך הכל משימות</p>
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="progress" className="mt-2">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow p-4 border border-purple-100 dark:border-gray-700">
                    <div className="flex flex-col items-center">
                      <p className="text-muted-foreground mb-2">התקדמות משימות</p>
                      <div className="flex justify-between w-full mb-2">
                        <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
                        <span className="text-sm text-muted-foreground">
                          {tasksStats.completed}/{tasksStats.total}
                        </span>
                      </div>
                      <Progress value={completionPercentage} className="h-2 w-full" />
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10"
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition duration-300 p-6 border border-purple-100 dark:border-gray-700">
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{teamMembers.length}</h3>
                  <p className="text-muted-foreground">חברי צוות</p>
                </div>
              </Card>
              
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition duration-300 p-6 border border-purple-100 dark:border-gray-700">
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                    <BarChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">{tasksStats.total}</h3>
                  <p className="text-muted-foreground">סך הכל משימות</p>
                </div>
              </Card>
              
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition duration-300 p-6 border border-purple-100 dark:border-gray-700">
                <div className="flex flex-col items-center">
                  <p className="text-muted-foreground mb-2">התקדמות משימות</p>
                  <div className="flex justify-between w-full mb-2">
                    <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
                    <span className="text-sm text-muted-foreground">
                      {tasksStats.completed}/{tasksStats.total}
                    </span>
                  </div>
                  <Progress value={completionPercentage} className="h-2 w-full" />
                </div>
              </Card>
            </motion.div>
          )}

          <div className="flex justify-center gap-4 mb-8">
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
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
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
                isEditMode={isEditMode}
                onDelete={refetch}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TeamMembers;
