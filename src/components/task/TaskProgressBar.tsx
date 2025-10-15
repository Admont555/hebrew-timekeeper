
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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
  // Make sure progress is between 0 and 100
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  
  // Get color class based on progress
  const getColorClass = () => {
    if (normalizedProgress < 25) return "bg-destructive";
    if (normalizedProgress < 50) return "bg-task-normal";
    if (normalizedProgress < 75) return "bg-task-normal";
    return "bg-task-low";
  };

  // Get container class based on progress
  const getContainerClass = () => {
    if (normalizedProgress < 25) return "bg-destructive/10";
    if (normalizedProgress < 50) return "bg-task-normal-bg";
    if (normalizedProgress < 75) return "bg-task-normal-bg";
    return "bg-task-low-bg";
  };

  // Get height based on size
  const getHeight = () => {
    switch (size) {
      case 'sm': return "h-1";
      case 'lg': return "h-3";
      default: return "h-2";
    }
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      <Progress 
        value={normalizedProgress} 
        className={cn(
          getHeight(), 
          getContainerClass(),
          "overflow-hidden rounded-full border border-border/30 shadow-sm"
        )}
        indicatorClassName={getColorClass()}
        aria-label="התקדמות המשימה"
      />
      {showLabel && (
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground font-medium">
            {normalizedProgress}%
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskProgressBar;
