
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
    if (normalizedProgress < 25) return "bg-red-500";
    if (normalizedProgress < 50) return "bg-orange-500";
    if (normalizedProgress < 75) return "bg-yellow-500";
    return "bg-green-500";
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
        className={cn(getHeight(), "bg-gray-200 dark:bg-gray-700", getColorClass())}
        aria-label="התקדמות המשימה"
      />
      {showLabel && (
        <div className="flex justify-end">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {normalizedProgress}%
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskProgressBar;
