import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { playNotificationSound } from "@/utils/sound";
import { Pause, Play } from "lucide-react";

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

  useEffect(() => {
    if (Notification.permission === "default") {
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
      // Resume
      if (pausedTimeRef.current) {
        const pausedDuration = Date.now() - pausedTimeRef.current;
        if (startTimeRef.current) {
          startTimeRef.current += pausedDuration;
        }
      }
      setIsPaused(false);
      setIsRunning(true);
    } else {
      // Pause
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

  return (
    <div className="flex items-center gap-2">
      <span 
        className={`text-lg font-mono font-bold 
          ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-primary'} 
          bg-accent/30 px-3 py-1 rounded-md`}
      >
        {formatTime(timeLeft)}
      </span>
      {!isRunning && !startTime && (
        <Button variant="outline" size="sm" onClick={handleStart}>
          התחל
        </Button>
      )}
      {isRunning && (
        <Button
          variant="outline"
          size="icon"
          onClick={handlePauseResume}
          className="h-8 w-8"
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
};

export default CountdownTimer;