import { useEffect, useState } from "react";
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
  const [timeLeft, setTimeLeft] = useState<number>(duration * 60); // Convert to seconds initially
  const [isRunning, setIsRunning] = useState<boolean>(!!startTime);
  const { toast } = useToast();

  useEffect(() => {
    // Request notification permissions when component mounts
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!isRunning || isCompleted) return;

    const calculateTimeLeft = () => {
      if (!startTime) {
        return timeLeft; // Use current timeLeft for manual start
      }

      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - start) / 1000);
      const remainingSeconds = (duration * 60) - elapsedSeconds;
      return Math.max(0, remainingSeconds);
    };

    const handleComplete = () => {
      onComplete();
      playNotificationSound();
      setIsRunning(false);
      toast({
        title: "זמן המשימה הסתיים",
        description: "המשימה הושלמה באופן אוטומטי",
      });
    };

    // Initial calculation
    const currentTimeLeft = calculateTimeLeft();
    setTimeLeft(currentTimeLeft);

    if (currentTimeLeft <= 0) {
      handleComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          handleComplete();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, startTime, isRunning, isCompleted, onComplete, toast]);

  const handleStart = () => {
    setIsRunning(true);
    setTimeLeft(duration * 60); // Reset to full duration when manually started
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