import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

interface CountdownTimerProps {
  duration: number; // in minutes
  startTime?: string;
  isCompleted: boolean;
  onComplete: () => void;
}

const CountdownTimer = ({ duration, startTime, isCompleted, onComplete }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (startTime) {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - start) / 1000);
      const totalSeconds = duration * 60;
      const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
      setTimeLeft(Math.floor(remainingSeconds / 60));
      setSeconds(remainingSeconds % 60);
      setIsRunning(true);
    } else {
      setTimeLeft(duration);
      setSeconds(0);
    }
  }, [duration, startTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isCompleted && (timeLeft > 0 || seconds > 0)) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            setTimeLeft((prevMinutes) => {
              if (prevMinutes === 0) {
                clearInterval(interval);
                onComplete();
                toast({
                  title: "הזמן נגמר!",
                  description: "המשימה הסתיימה",
                });
                return 0;
              }
              return prevMinutes - 1;
            });
            return 59;
          }
          return prevSeconds - 1;
        });
      }, 1000); // Update every second
    }

    return () => clearInterval(interval);
  }, [isRunning, isCompleted, timeLeft, seconds, onComplete, toast]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const formatTime = (minutes: number, secs: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompleted) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-mono">{formatTime(timeLeft, seconds)}</span>
      {!isRunning && !startTime && (
        <Button variant="outline" size="sm" onClick={handleStart}>
          התחל
        </Button>
      )}
    </div>
  );
};

export default CountdownTimer;