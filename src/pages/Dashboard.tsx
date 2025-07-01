import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavMenu } from "@/components/NavMenu";
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users,
  BarChart3,
  Calendar,
  FolderOpen,
  Target
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const Dashboard = () => {
  // Get all tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get team members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['dashboard-team'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Get projects
  const { data: projects = [] } = useQuery({
    queryKey: ['dashboard-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Calculate statistics
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.filter(task => !task.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(task => task.date === today);
  const todayCompleted = todayTasks.filter(task => task.completed).length;

  const highPriorityTasks = tasks.filter(task => task.priority === 'high' && !task.completed).length;
  
  // Tasks by team member
  const tasksByMember = teamMembers.map(member => {
    const memberTasks = tasks.filter(task => task.worker === member.worker_id);
    const memberCompleted = memberTasks.filter(task => task.completed).length;
    const memberCompletionRate = memberTasks.length > 0 ? Math.round((memberCompleted / memberTasks.length) * 100) : 0;
    
    return {
      ...member,
      totalTasks: memberTasks.length,
      completedTasks: memberCompleted,
      completionRate: memberCompletionRate
    };
  });

  // Projects overview
  const projectsWithTasks = projects.map(project => {
    const projectTasks = tasks.filter(task => task.project_id === project.id);
    const projectCompleted = projectTasks.filter(task => task.completed).length;
    const projectProgress = projectTasks.length > 0 ? Math.round((projectCompleted / projectTasks.length) * 100) : 0;
    
    return {
      ...project,
      totalTasks: projectTasks.length,
      completedTasks: projectCompleted,
      progress: projectProgress
    };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <>
      <NavMenu />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              לוח מצב
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              סקירה כללית של המשימות והפרויקטים
            </p>
          </motion.div>

          {/* Main Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">משימות הושלמו</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    {completionRate}% מכלל המשימות
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">משימות ממתינות</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    {highPriorityTasks} בעדיפות גבוהה
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">משימות היום</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{todayTasks.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {todayCompleted} הושלמו היום
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">פרויקטים פעילים</CardTitle>
                  <FolderOpen className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{projects.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {projectsWithTasks.filter(p => p.progress < 100).length} בתהליך
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    ביצועי צוות
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tasksByMember.map((member, index) => (
                    <div key={member.worker_id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{member.name}</span>
                        <Badge variant="outline">
                          {member.completedTasks}/{member.totalTasks}
                        </Badge>
                      </div>
                      <Progress value={member.completionRate} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {member.completionRate}% השלמה
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    התקדמות פרויקטים
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projectsWithTasks.slice(0, 5).map((project) => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{project.title}</span>
                        <Badge variant={project.progress === 100 ? "default" : "secondary"}>
                          {project.progress}%
                        </Badge>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {project.completedTasks}/{project.totalTasks} משימות
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  התקדמות כללית
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">השלמת משימות כללית</span>
                    <span className="text-2xl font-bold text-purple-600">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-4" />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                      <p className="text-sm text-muted-foreground">הושלמו</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{pendingTasks}</p>
                      <p className="text-sm text-muted-foreground">ממתינות</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
                      <p className="text-sm text-muted-foreground">סה"כ</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;