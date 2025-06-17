
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, Play, Pause, Square, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { format, formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

interface Task {
  id: string;
  title: string;
  project_id?: string;
  completed: boolean;
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

  const { data: timeLogs, refetch: refetchTimeLogs } = useQuery({
    queryKey: ['time-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_logs')
        .select(`
          *,
          tasks:task_id (
            id,
            title,
            project_id,
            completed
          )
        `)
        .order('start_time', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as TimeLog[];
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ['available-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, project_id, completed')
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

    const { error } = await supabase
      .from('time_logs')
      .insert({
        task_id: taskId,
        start_time: now.toISOString(),
        worker: 'worker1'
      });

    if (error) {
      console.error('Error starting timer:', error);
    } else {
      refetchTimeLogs();
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
    } else {
      setActiveTaskId(null);
      setStartTime(null);
      refetchTimeLogs();
    }
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 pt-20">
        <div className="flex items-center gap-3 mb-6">
          <Timer className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">ניהול זמן</h1>
        </div>

        {/* Active Timer */}
        {activeTaskId && startTime && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-green-500" />
                טיימר פעיל
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {tasks?.find(t => t.id === activeTaskId)?.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    התחיל: {format(startTime, 'HH:mm', { locale: he })}
                  </p>
                </div>
                <Button onClick={stopTimer} variant="destructive" size="sm">
                  <Square className="h-4 w-4 mr-2" />
                  עצור
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Tasks */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>משימות זמינות</CardTitle>
            <CardDescription>בחר משימה להתחלת מעקב זמן</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {tasks?.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    {task.project_id && (
                      <Badge variant="outline" className="mt-1">
                        פרויקט: {task.project_id}
                      </Badge>
                    )}
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
            </div>
          </CardContent>
        </Card>

        {/* Time Logs History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              היסטוריית זמן
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeLogs?.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{log.tasks?.title || 'משימה לא זמינה'}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(log.start_time), 'dd/MM/yyyy HH:mm', { locale: he })}
                      {log.end_time && ` - ${format(new Date(log.end_time), 'HH:mm', { locale: he })}`}
                    </p>
                  </div>
                  <div className="text-left">
                    {log.duration ? (
                      <Badge variant="secondary">
                        {formatDuration(log.duration)}
                      </Badge>
                    ) : (
                      <Badge variant="outline">פעיל</Badge>
                    )}
                  </div>
                </div>
              ))}
              {!timeLogs?.length && (
                <p className="text-center text-muted-foreground py-8">
                  אין רישומי זמן עדיין
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeTracking;
