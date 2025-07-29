import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Timer, 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Calendar as CalendarIcon,
  BarChart3,
  Target,
  TrendingUp,
  Coffee,
  Award,
  Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { format, formatDistanceToNow, startOfDay, endOfDay, subDays, addHours } from "date-fns";
import { he } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  project_id?: string;
  completed: boolean;
  priority?: string;
}

interface TimeLog {
  id: string;
  task_id: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  worker: string;
  tasks?: Task;
}

interface TimeStats {
  todayTotal: number;
  weekTotal: number;
  averageDaily: number;
  longestSession: number;
  completedTasks: number;
  productivity: number;
}

const TimeTracking = () => {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterBy, setFilterBy] = useState<string>("all");
  const [dailyGoal, setDailyGoal] = useState<number>(8 * 3600); // 8 hours in seconds
  const [isBreakTime, setIsBreakTime] = useState<boolean>(false);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const { toast } = useToast();

  // Real-time timer update
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeTaskId && startTime && !isBreakTime) {
      interval = setInterval(() => {
        const now = new Date();
        setElapsedTime(Math.floor((now.getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTaskId, startTime, isBreakTime]);

  const { data: timeLogs, refetch: refetchTimeLogs } = useQuery({
    queryKey: ['time-logs', selectedDate],
    queryFn: async () => {
      const startOfSelectedDay = startOfDay(selectedDate);
      const endOfSelectedDay = endOfDay(selectedDate);
      
      const { data, error } = await supabase
        .from('time_logs')
        .select(`
          *,
          tasks:task_id (
            id,
            title,
            project_id,
            completed,
            priority
          )
        `)
        .gte('start_time', startOfSelectedDay.toISOString())
        .lte('start_time', endOfSelectedDay.toISOString())
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data as TimeLog[];
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ['available-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, project_id, completed, priority')
        .eq('completed', false)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
  });

  const { data: timeStats } = useQuery({
    queryKey: ['time-stats'],
    queryFn: async (): Promise<TimeStats> => {
      const today = new Date();
      const weekAgo = subDays(today, 7);
      
      const { data: weekLogs, error } = await supabase
        .from('time_logs')
        .select('*')
        .gte('start_time', weekAgo.toISOString())
        .not('duration', 'is', null);

      if (error) throw error;

      const todayLogs = weekLogs.filter(log => 
        startOfDay(new Date(log.start_time)).getTime() === startOfDay(today).getTime()
      );

      const todayTotal = todayLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
      const weekTotal = weekLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
      const averageDaily = weekTotal / 7;
      const longestSession = Math.max(...weekLogs.map(log => log.duration || 0), 0);
      const completedTasks = todayLogs.length;
      
      // Calculate productivity score (0-100)
      const goalProgress = Math.min((todayTotal / dailyGoal) * 100, 100);
      const consistency = weekLogs.length >= 5 ? 20 : (weekLogs.length * 4);
      const productivity = Math.round((goalProgress * 0.7) + (consistency * 0.3));

      return {
        todayTotal,
        weekTotal,
        averageDaily,
        longestSession,
        completedTasks,
        productivity
      };
    },
  });

  const startTimer = async (taskId: string) => {
    const now = new Date();
    setActiveTaskId(taskId);
    setStartTime(now);
    setElapsedTime(0);

    const { error } = await supabase
      .from('time_logs')
      .insert({
        task_id: taskId,
        start_time: now.toISOString(),
        worker: 'worker1'
      });

    if (error) {
      console.error('Error starting timer:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להתחיל את הטיימר",
        variant: "destructive"
      });
    } else {
      refetchTimeLogs();
      toast({
        title: "טיימר הופעל",
        description: `התחיל מעקב זמן עבור: ${tasks?.find(t => t.id === taskId)?.title}`,
      });
    }
  };

  const stopTimer = async () => {
    if (!activeTaskId || !startTime) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    const { error } = await supabase
      .from('time_logs')
      .update({
        end_time: endTime.toISOString(),
        duration: duration
      })
      .eq('task_id', activeTaskId)
      .is('end_time', null);

    if (error) {
      console.error('Error stopping timer:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעצור את הטיימר",
        variant: "destructive"
      });
    } else {
      setActiveTaskId(null);
      setStartTime(null);
      setElapsedTime(0);
      refetchTimeLogs();
      
      const taskTitle = tasks?.find(t => t.id === activeTaskId)?.title;
      toast({
        title: "טיימר נעצר",
        description: `סיימת לעבוד על: ${taskTitle} (${formatDuration(duration)})`,
      });
    }
  };

  const startBreak = () => {
    setIsBreakTime(true);
    setBreakStartTime(new Date());
    toast({
      title: "הפסקה התחילה",
      description: "זמן לנוח קצת! 🎯",
    });
  };

  const endBreak = () => {
    setIsBreakTime(false);
    setBreakStartTime(null);
    if (startTime) {
      const now = new Date();
      setStartTime(addHours(startTime, 0)); // Resume from where we left off
    }
    toast({
      title: "חזרת מההפסקה",
      description: "בואו נמשיך לעבוד! 💪",
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredTasks = tasks?.filter(task => {
    if (filterBy === 'all') return true;
    return task.priority === filterBy;
  });

  const goalProgress = timeStats ? Math.min((timeStats.todayTotal / dailyGoal) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <div className="container mx-auto p-4 sm:p-6 pt-20 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Timer className="h-8 w-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient">ניהול זמן מתקדם</h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="glass-effect">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">יעד יומי</p>
                  <p className="text-lg font-bold">{Math.round(goalProgress)}%</p>
                </div>
              </div>
              <Progress value={goalProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">היום</p>
                  <p className="text-lg font-bold">{formatDuration(timeStats?.todayTotal || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ממוצע שבועי</p>
                  <p className="text-lg font-bold">{formatDuration(timeStats?.averageDaily || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">פרודקטיביות</p>
                  <p className="text-lg font-bold">{timeStats?.productivity || 0}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Timer */}
        {activeTaskId && startTime && (
          <Card className="mb-6 border-primary/20 bg-gradient-primary text-white soft-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isBreakTime ? (
                    <Coffee className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 text-green-400" />
                  )}
                  {isBreakTime ? 'הפסקה' : 'טיימר פעיל'}
                </div>
                <div className="text-2xl font-mono">
                  {formatDuration(elapsedTime)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white/90">
                    {tasks?.find(t => t.id === activeTaskId)?.title}
                  </p>
                  <p className="text-sm text-white/70">
                    התחיל: {format(startTime, 'HH:mm', { locale: he })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!isBreakTime ? (
                    <>
                      <Button onClick={startBreak} variant="secondary" size="sm">
                        <Coffee className="h-4 w-4 mr-2" />
                        הפסקה
                      </Button>
                      <Button onClick={stopTimer} variant="destructive" size="sm">
                        <Square className="h-4 w-4 mr-2" />
                        עצור
                      </Button>
                    </>
                  ) : (
                    <Button onClick={endBreak} variant="secondary" size="sm">
                      <Zap className="h-4 w-4 mr-2" />
                      חזור לעבודה
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Tasks */}
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>משימות זמינות</CardTitle>
                  <CardDescription>בחר משימה להתחלת מעקב זמן</CardDescription>
                </div>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">הכל</SelectItem>
                    <SelectItem value="high">עדיפות גבוהה</SelectItem>
                    <SelectItem value="medium">עדיפות בינונית</SelectItem>
                    <SelectItem value="low">עדיפות נמוכה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredTasks?.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {task.priority && (
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                            {task.priority === 'high' ? 'גבוהה' : task.priority === 'medium' ? 'בינונית' : 'נמוכה'}
                          </Badge>
                        )}
                        {task.project_id && (
                          <Badge variant="outline" className="text-xs">
                            פרויקט: {task.project_id}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => startTimer(task.id)}
                      disabled={activeTaskId === task.id}
                      variant={activeTaskId === task.id ? "secondary" : "default"}
                      size="sm"
                    >
                      {activeTaskId === task.id ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          פעיל
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          התחל
                        </>
                      )}
                    </Button>
                  </div>
                ))}
                {!filteredTasks?.length && (
                  <p className="text-center text-muted-foreground py-8">
                    אין משימות זמינות
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Time Logs History */}
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <CardTitle>היסטוריית זמן</CardTitle>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(selectedDate, 'dd/MM')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {timeLogs?.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div className="flex-1">
                      <p className="font-medium">{log.tasks?.title || 'משימה לא זמינה'}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(log.start_time), 'HH:mm', { locale: he })}
                        {log.end_time && ` - ${format(new Date(log.end_time), 'HH:mm', { locale: he })}`}
                      </p>
                    </div>
                    <div>
                      {log.duration ? (
                        <Badge variant="secondary" className="font-mono">
                          {formatDuration(log.duration)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="animate-pulse">
                          פעיל
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {!timeLogs?.length && (
                  <p className="text-center text-muted-foreground py-8">
                    אין רישומי זמן עבור תאריך זה
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;