
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
          color: 'text-task-high',
          bg: 'bg-task-high-bg',
          border: 'border-task-high-border/40',
          label: 'דחוף'
        };
      case 'normal':
        return {
          color: 'text-task-normal',
          bg: 'bg-task-normal-bg',
          border: 'border-task-normal-border/40',
          label: 'רגיל'
        };
      case 'low':
        return {
          color: 'text-task-low',
          bg: 'bg-task-low-bg',
          border: 'border-task-low-border/40',
          label: 'נמוך'
        };
      default:
        return {
          color: 'text-muted-foreground',
          bg: 'bg-muted',
          border: 'border-border/40',
          label: ''
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md",
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
