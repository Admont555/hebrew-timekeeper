import { Flag, AlertTriangle, ArrowDown, Minus } from "lucide-react";
import { TaskPriority as Priority } from "@/types/task";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
          gradient: 'from-task-high/20 to-rose-500/10',
          label: 'דחוף',
          Icon: AlertTriangle,
          animate: true
        };
      case 'normal':
        return {
          color: 'text-task-normal',
          bg: 'bg-task-normal-bg',
          border: 'border-task-normal-border/40',
          gradient: 'from-task-normal/20 to-amber-500/10',
          label: 'רגיל',
          Icon: Minus,
          animate: false
        };
      case 'low':
        return {
          color: 'text-task-low',
          bg: 'bg-task-low-bg',
          border: 'border-task-low-border/40',
          gradient: 'from-task-low/20 to-emerald-500/10',
          label: 'נמוך',
          Icon: ArrowDown,
          animate: false
        };
      default:
        return {
          color: 'text-muted-foreground',
          bg: 'bg-muted',
          border: 'border-border/40',
          gradient: 'from-muted/20 to-muted/10',
          label: '',
          Icon: Flag,
          animate: false
        };
    }
  };

  const config = getPriorityConfig(priority);
  const Icon = config.Icon;

  return (
    <motion.div 
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm shadow-sm transition-all duration-300",
        "bg-gradient-to-br",
        config.gradient,
        config.border,
        "hover:shadow-md hover:scale-105"
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -1 }}
    >
      <motion.div
        animate={config.animate ? { 
          scale: [1, 1.2, 1],
          rotate: [0, -10, 10, 0]
        } : {}}
        transition={config.animate ? { 
          repeat: Infinity, 
          duration: 1.5,
          ease: "easeInOut"
        } : {}}
      >
        <Icon className={cn("h-3.5 w-3.5", config.color)} />
      </motion.div>
      <span className={cn("text-xs font-semibold", config.color)}>
        {config.label}
      </span>
    </motion.div>
  );
};

export default TaskPriority;