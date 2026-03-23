import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Timer, 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Calendar as CalendarIcon,
  Coffee,
  Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { format, startOfDay, endOfDay } from "date-fns";
import { he } from "date-fns/locale";
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

const TimeTracking = () => {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isBreakTime, setIsBreakTime] = useState<boolean>(false);
  const [filterBy, setFilterBy] = useState<string>("all");
  const { toast } = useToast();

  // Real-time timer update
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
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
    queryKey: ['time-logs'],
    queryFn: async () => {
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);
      
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
        .gte('start_time', startOfToday.toISOString())
        .lte('start_time', endOfToday.toISOString())
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
        .order('title');

      if (error) throw error;
      return data as Task[];
    },
  });

  const startTimer = async (taskId: string) => {
    const now = new Date();
    setActiveTaskId(taskId);
    setStartTime(now);
    setElapsedTime(0);
    setIsBreakTime(false);

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
      const taskTitle = tasks?.find(t => t.id === taskId)?.title;
      toast({
        title: "טיימר הופעל",
        description: `התחיל מעקב זמן עבור: ${taskTitle}`,
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
      const taskTitle = tasks?.find(t => t.id === activeTaskId)?.title;
      setActiveTaskId(null);
      setStartTime(null);
      setElapsedTime(0);
      setIsBreakTime(false);
      refetchTimeLogs();
      
      toast({
        title: "טיימר נעצר",
        description: `סיימת לעבוד על: ${taskTitle} (${formatDuration(duration)})`,
      });
    }
  };

  const startBreak = () => {
    setIsBreakTime(true);
    toast({
      title: "הפסקה התחילה",
      description: "זמן לנוח קצת! ☕",
    });
  };

  const endBreak = () => {
    setIsBreakTime(false);
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

  const getPriorityText = (priority?: string) => {
    switch (priority) {
      case 'high': return 'גבוהה';
      case 'medium': return 'בינונית';
      case 'low': return 'נמוכה';
      default: return 'רגילה';
    }
  };

  const filteredTasks = tasks?.filter(task => {
    if (filterBy === 'all') return true;
    return task.priority === filterBy;
  });

  // Calculate today's total time
  const todayTotal = timeLogs?.reduce((sum, log) => sum + (log.duration || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 pt-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Timer className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">ניהול זמן</h1>
          </div>
          
          {/* Today's Summary */}
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">היום</p>
                <p className="text-lg font-bold">{formatDuration(todayTotal)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Timer */}
        {activeTaskId && startTime && (
          <Card className="mb-6 border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 shadow-lg animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isBreakTime ? (
                    <>
                      <div className="p-2 rounded-full bg-orange-500/20 animate-pulse">
                        <Coffee className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <span className="text-lg font-bold text-orange-500">הפסקה פעילה</span>
                        <p className="text-sm text-muted-foreground">זמן לנוח ☕</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2 rounded-full bg-green-500/20 animate-pulse">
                        <Play className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <span className="text-lg font-bold text-green-500">עובד כעת</span>
                        <p className="text-sm text-muted-foreground">ממוקד ופרודוקטיבי 🚀</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-mono font-bold text-primary animate-pulse">
                    {formatDuration(elapsedTime)}
                  </div>
                  <p className="text-xs text-muted-foreground">זמן נוכחי</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border">
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-1">
                    {tasks?.find(t => t.id === activeTaskId)?.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>התחיל: {format(startTime, 'HH:mm', { locale: he })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⚖️</span>
                      <span>משקל: {tasks?.find(t => t.id === activeTaskId)?.priority === 'high' ? 'כבד' : tasks?.find(t => t.id === activeTaskId)?.priority === 'medium' ? 'בינוני' : 'קל'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  {!isBreakTime ? (
                    <>
                      <Button 
                        onClick={startBreak} 
                        variant="outline" 
                        size="lg"
                        className="hover-scale transition-all duration-200"
                      >
                        <Coffee className="h-5 w-5 mr-2" />
                        הפסקה
                      </Button>
                      <Button 
                        onClick={stopTimer} 
                        variant="destructive" 
                        size="lg"
                        className="hover-scale transition-all duration-200"
                      >
                        <Square className="h-5 w-5 mr-2" />
                        סיום
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={endBreak} 
                      variant="default" 
                      size="lg"
                      className="hover-scale bg-green-600 hover:bg-green-700 transition-all duration-200"
                    >
                      <Zap className="h-5 w-5 mr-2" />
                      חזור לעבודה
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Tasks - Full Width */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>משימות זמינות</CardTitle>
                <CardDescription>בחר משימה להתחלת מעקב זמן</CardDescription>
              </div>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-36">
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
            <div className="space-y-4">
              {filteredTasks?.map((task) => {
                const isActive = activeTaskId === task.id;
                return (
                  <div 
                    key={task.id} 
                    className={`group flex items-center justify-between p-6 border-2 rounded-xl transition-all duration-300 hover-scale ${
                      isActive 
                        ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]' 
                        : 'border-border/50 hover:border-primary/50 bg-card hover:shadow-md'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full transition-colors ${
                          isActive ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'
                        }`} />
                        <h3 className={`font-semibold text-xl transition-colors ${
                          isActive ? 'text-primary' : 'text-foreground'
                        }`}>
                          {task.title}
                        </h3>
                        {task.priority && (
                          <Badge 
                            variant={getPriorityColor(task.priority)} 
                            className="font-medium animate-fade-in"
                          >
                            {getPriorityText(task.priority)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {task.project_id && (
                          <div className="flex items-center gap-1 transition-colors group-hover:text-foreground">
                            <span>📁</span>
                            <span>פרויקט: {task.project_id}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 transition-colors group-hover:text-foreground">
                          <span>⚖️</span>
                          <span>משקל: {task.priority === 'high' ? 'כבד' : task.priority === 'medium' ? 'בינוני' : 'קל'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <Button
                        onClick={() => startTimer(task.id)}
                        disabled={isActive}
                        variant={isActive ? "secondary" : "default"}
                        size="lg"
                        className={`min-w-[140px] font-semibold transition-all duration-300 ${
                          isActive 
                            ? 'bg-primary/20 text-primary border-primary/30 cursor-not-allowed' 
                            : 'hover-scale shadow-sm hover:shadow-md'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <div className="h-5 w-5 mr-2 rounded-full bg-primary animate-pulse" />
                            עובד כעת
                          </>
                        ) : (
                          <>
                            <Play className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
                            התחל עבודה
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {!filteredTasks?.length && (
              <div className="text-center py-16">
                <Timer className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">אין משימות זמינות</h3>
                <p className="text-muted-foreground">צור משימות חדשות כדי להתחיל מעקב זמן</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeTracking;