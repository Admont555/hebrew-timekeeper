import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface TaskStatsProps {
  workerId: string;
  selectedDate: Date;
}

const TaskStats = ({ workerId, selectedDate }: TaskStatsProps) => {
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', workerId, selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('worker', workerId)
        .eq('date', selectedDate.toISOString().split('T')[0]);

      if (error) throw error;
      return data || [];
    },
  });

  const calculateStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    return {
      total: totalTasks,
      completed: completedTasks,
      progress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    };
  };

  const stats = calculateStats();

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 shadow-lg mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">התקדמות משימות</span>
        <span className="text-sm font-medium">
          {stats.completed} / {stats.total}
        </span>
      </div>
      <Progress 
        value={stats.progress} 
        className="h-2"
        aria-label="התקדמות משימות"
      />
    </div>
  );
};

export default TaskStats;