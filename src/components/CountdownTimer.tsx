import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { playNotificationSound } from "@/utils/sound";
import { Pause, Play, Clock, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  duration: number; // in minutes
  startTime?: string;
  isCompleted: boolean;
  onComplete: () => void;
}

const CountdownTimer = ({ duration, startTime, isCompleted, onComplete }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const { toast } = useToast();
  
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const pausedTimeRef = useRef<number>();
  const durationRef = useRef<number>(0);

  const totalDuration = duration * 60;
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (startTime) {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - start) / 1000);
      const remainingSeconds = Math.max(0, (duration * 60) - elapsedSeconds);
      setTimeLeft(remainingSeconds);
      durationRef.current = remainingSeconds;
      startTimeRef.current = now - (elapsedSeconds * 1000);
      setIsRunning(true);
    } else {
      setTimeLeft(duration * 60);
      durationRef.current = duration * 60;
    }
  }, [duration, startTime]);

  useEffect(() => {
    if (!isRunning || isCompleted || isPaused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const handleComplete = () => {
      onComplete();
      playNotificationSound();
      setIsRunning(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      toast({
        title: "זמן המשימה הסתיים",
        description: "המשימה הושלמה באופן אוטומטי",
      });
    };

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    const updateTimer = () => {
      if (!startTimeRef.current) return;

      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      const remaining = Math.max(0, durationRef.current - elapsed);

      setTimeLeft(remaining);

      if (remaining <= 0) {
        handleComplete();
      } else {
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, isCompleted, isPaused, onComplete, toast]);

  const handleStart = () => {
    startTimeRef.current = Date.now();
    setIsRunning(true);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      if (pausedTimeRef.current) {
        const pausedDuration = Date.now() - pausedTimeRef.current;
        if (startTimeRef.current) {
          startTimeRef.current += pausedDuration;
        }
      }
      setIsPaused(false);
      setIsRunning(true);
    } else {
      pausedTimeRef.current = Date.now();
      setIsPaused(true);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompleted) return null;

  const isLowTime = timeLeft < 60;
  const isVeryLowTime = timeLeft < 30;

  return (
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Circular progress indicator */}
      <div className="relative">
        <motion.div 
          className={cn(
            "relative flex items-center justify-center rounded-full",
            isRunning ? "w-16 h-16" : "w-14 h-14"
          )}
          animate={isLowTime && isRunning ? { scale: [1, 1.05, 1] } : {}}
          transition={isLowTime ? { repeat: Infinity, duration: 0.5 } : {}}
        >
          {/* Background circle */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="4"
            />
            {isRunning && (
              <motion.circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke={isVeryLowTime ? "hsl(var(--destructive))" : isLowTime ? "hsl(var(--task-priority-normal))" : "hsl(var(--primary))"}
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  strokeDasharray: "283",
                  strokeDashoffset: `${283 - (283 * progress / 100)}`,
                }}
              />
            )}
          </svg>
          
          {/* Timer icon */}
          <motion.div
            className={cn(
              "z-10",
              isVeryLowTime && isRunning ? "text-destructive" : 
              isLowTime && isRunning ? "text-task-normal" : "text-primary"
            )}
            animate={isLowTime && isRunning ? { rotate: [0, -10, 10, 0] } : {}}
            transition={isLowTime ? { repeat: Infinity, duration: 0.3 } : {}}
          >
            <Timer className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>

      {/* Time display */}
      <motion.div
        className={cn(
          "font-mono font-bold text-lg px-4 py-2 rounded-xl backdrop-blur-sm border transition-all duration-300",
          isVeryLowTime && isRunning
            ? "bg-destructive/10 border-destructive/30 text-destructive animate-pulse"
            : isLowTime && isRunning
            ? "bg-task-normal-bg border-task-normal-border/30 text-task-normal"
            : "bg-accent/50 border-border/50 text-foreground"
        )}
        animate={isVeryLowTime && isRunning ? { scale: [1, 1.02, 1] } : {}}
        transition={isVeryLowTime ? { repeat: Infinity, duration: 0.3 } : {}}
      >
        {formatTime(timeLeft)}
      </motion.div>

      {/* Control buttons */}
      <AnimatePresence mode="wait">
        {!isRunning && !startTime ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleStart}
              className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
            >
              <Play className="h-4 w-4 mr-1" />
              התחל
            </Button>
          </motion.div>
        ) : isRunning ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={handlePauseResume}
              className={cn(
                "h-10 w-10 rounded-xl border-2 transition-all duration-300",
                isPaused 
                  ? "border-primary bg-primary/10 hover:bg-primary/20 text-primary" 
                  : "border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/50"
              )}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
              >
                {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </motion.div>
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

export default CountdownTimer;