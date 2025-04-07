
import { Flag } from "lucide-react";
import { TaskPriority as Priority } from "@/types/task";
import { cn } from "@/lib/utils";

interface TaskPriorityProps {
  priority: Priority;
}

const TaskPriority = ({ priority }: TaskPriorityProps) => {
  const getPriorityConfig = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return {
          color: 'text-red-500 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800/30',
          label: 'דחוף'
        };
      case 'normal':
        return {
          color: 'text-yellow-500 dark:text-yellow-400',
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800/30',
          label: 'רגיל'
        };
      case 'low':
        return {
          color: 'text-green-500 dark:text-green-400',
          bg: 'bg-green-100 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800/30',
          label: 'נמוך'
        };
      default:
        return {
          color: 'text-gray-500 dark:text-gray-400',
          bg: 'bg-gray-100 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          label: ''
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <div className={cn(
      "flex items-center gap-2 px-2 py-1 rounded-full border",
      config.bg,
      config.border
    )}>
      <Flag className={cn("h-3.5 w-3.5", config.color)} />
      <span className={cn("text-xs font-medium", config.color)}>
        {config.label}
      </span>
    </div>
  );
};

export default TaskPriority;
