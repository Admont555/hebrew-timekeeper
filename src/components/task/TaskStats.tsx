import { TasksByDate } from "@/types/task";
import { Progress } from "@/components/ui/progress";

interface TaskStatsProps {
  tasksByDate: TasksByDate;
}

const TaskStats = ({ tasksByDate }: TaskStatsProps) => {
  const calculateStats = () => {
    let totalTasks = 0;
    let completedTasks = 0;

    Object.values(tasksByDate).forEach(tasks => {
      totalTasks += tasks.length;
      completedTasks += tasks.filter(task => task.completed).length;
    });

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