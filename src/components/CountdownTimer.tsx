import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { playNotificationSound } from "@/utils/sound";

interface CountdownTimerProps {
  duration: number; // in minutes
  startTime?: string;
  isCompleted: boolean;
  onComplete: () => void;
}

const CountdownTimer = ({ duration, startTime, isCompleted, onComplete }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Refs to store the animation frame and start time
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const durationRef = useRef<number>(0);

  useEffect(() => {
    // Request notification permissions when component mounts
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Cleanup function to cancel animation frame
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Initialize timeLeft based on startTime or duration
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
    if (!isRunning || isCompleted) {
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

    // Start the timer using requestAnimationFrame
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

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, isCompleted, onComplete, toast]);

  const handleStart = () => {
    startTimeRef.current = Date.now();
    setIsRunning(true);
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
    </div>
  );
};

export default CountdownTimer;