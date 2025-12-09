import React from 'react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TaskProgressBarProps {
  progress: number; // 0-100
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const TaskProgressBar = ({ 
  progress, 
  className,
  size = 'md', 
  showLabel = true 
}: TaskProgressBarProps) => {
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  
  const getColorClass = () => {
    if (normalizedProgress < 25) return "bg-gradient-to-r from-destructive to-rose-400";
    if (normalizedProgress < 50) return "bg-gradient-to-r from-task-normal to-amber-400";
    if (normalizedProgress < 75) return "bg-gradient-to-r from-task-normal to-lime-400";
    return "bg-gradient-to-r from-task-low to-emerald-400";
  };

  const getContainerClass = () => {
    if (normalizedProgress < 25) return "bg-destructive/10";
    if (normalizedProgress < 50) return "bg-task-normal-bg";
    if (normalizedProgress < 75) return "bg-task-normal-bg";
    return "bg-task-low-bg";
  };

  const getHeight = () => {
    switch (size) {
      case 'sm': return "h-2";
      case 'lg': return "h-4";
      default: return "h-3";
    }
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="relative">
        <Progress 
          value={normalizedProgress} 
          className={cn(
            getHeight(), 
            getContainerClass(),
            "overflow-hidden rounded-full border border-border/20 shadow-inner"
          )}
          indicatorClassName={cn(getColorClass(), "transition-all duration-500 ease-out")}
          aria-label="התקדמות המשימה"
        />
        
        {/* Animated shine effect */}
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-full pointer-events-none"
          initial={false}
        >
          <motion.div
            className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "400%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
      
      {showLabel && (
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {[25, 50, 75, 100].map((milestone) => (
              <motion.div
                key={milestone}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  normalizedProgress >= milestone 
                    ? "bg-primary shadow-sm shadow-primary/50" 
                    : "bg-muted-foreground/20"
                )}
                initial={false}
                animate={normalizedProgress >= milestone ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
          <motion.span 
            className={cn(
              "text-sm font-bold tabular-nums",
              normalizedProgress === 100 
                ? "text-task-low" 
                : normalizedProgress >= 75 
                ? "text-task-low/80"
                : "text-muted-foreground"
            )}
            key={normalizedProgress}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {normalizedProgress}%
          </motion.span>
        </div>
      )}
    </div>
  );
};

export default TaskProgressBar;