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
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    // Request notification permissions when component mounts
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (startTime) {
      const calculateTimeLeft = () => {
        const start = new Date(startTime).getTime();
        const now = new Date().getTime();
        const elapsedMinutes = (now - start) / (1000 * 60);
        const remainingMinutes = Math.max(0, duration - elapsedMinutes);
        
        if (remainingMinutes <= 0 && isRunning) {
          onComplete();
          playNotificationSound();
          setIsRunning(false);
        }
        
        return remainingMinutes;
      };

      setTimeLeft(calculateTimeLeft());
      setIsRunning(true);

      const timer = setInterval(() => {
        const remaining = calculateTimeLeft();
        setTimeLeft(remaining);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setTimeLeft(duration);
    }
  }, [duration, startTime, onComplete, isRunning]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes % 1) * 60);
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompleted) return null;

  return (
    <div className="flex items-center gap-2">
      <span className={`text-lg font-mono font-bold ${timeLeft < 1 ? 'text-red-500 animate-pulse' : 'text-primary'} bg-accent/30 px-3 py-1 rounded-md`}>
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