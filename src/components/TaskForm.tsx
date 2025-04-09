
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskPriority } from "@/types/task";
import VoiceInput from "./VoiceInput";

interface TaskFormProps {
  onAddTask: (title: string, duration: number, priority: TaskPriority) => void;
  initialTitle?: string;
  initialDuration?: number;
  initialPriority?: TaskPriority;
  submitLabel?: string;
  onCancel?: () => void;
}

const TaskForm = ({ 
  onAddTask, 
  initialTitle = "", 
  initialDuration = 0, 
  initialPriority = "normal",
  submitLabel = "הוסף", 
  onCancel 
}: TaskFormProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");
  const [priority, setPriority] = useState<TaskPriority>(initialPriority);

  useEffect(() => {
    if (initialDuration) {
      setHours(Math.floor(initialDuration / 60).toString());
      setMinutes((initialDuration % 60).toString());
    }
  }, [initialDuration]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      // Convert string inputs to numbers and handle NaN values
      const hoursNum = parseInt(hours) || 0;
      const minutesNum = parseInt(minutes) || 0;
      const totalMinutes = (hoursNum * 60) + minutesNum;
      
      onAddTask(title.trim(), totalMinutes, priority);
      
      if (!initialTitle) {
        setTitle("");
        setHours("0");
        setMinutes("0");
        setPriority("normal");
      }
    }
  };

  const handleVoiceInput = (text: string) => {
    setTitle(text);
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure valid numeric input
    const value = e.target.value.replace(/[^0-9]/g, '');
    setHours(value);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure valid numeric input
    const value = e.target.value.replace(/[^0-9]/g, '');
    setMinutes(value);
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="flex flex-col gap-4 mb-6 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      dir="rtl"
    >
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-2 flex-grow">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="הוסף משימה חדשה..."
            className="text-right bg-white/50 dark:bg-gray-800/50 border-purple-100 dark:border-gray-700 focus:border-purple-500 transition-colors duration-200 flex-grow"
            dir="rtl"
          />
          <VoiceInput onTranscription={handleVoiceInput} />
        </div>
        <div className="flex gap-2">
          <Button 
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 transition-colors duration-200 w-full sm:w-auto min-h-[44px] min-w-[44px]"
          >
            {submitLabel}
          </Button>
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-purple-200 hover:bg-purple-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200 w-full sm:w-auto min-h-[44px]"
            >
              ביטול
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row-reverse gap-4 items-start sm:items-center justify-end">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-gray-600 dark:text-gray-400 min-w-fit">עדיפות</Label>
          <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
            <SelectTrigger className="w-full sm:w-32 text-right min-h-[44px]" dir="rtl">
              <SelectValue placeholder="עדיפות" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="low">נמוכה</SelectItem>
              <SelectItem value="normal">רגילה</SelectItem>
              <SelectItem value="high">גבוהה</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-gray-600 dark:text-gray-400 min-w-fit">דקות</Label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            min="0"
            value={minutes}
            onChange={handleMinutesChange}
            className="w-full sm:w-20 text-right bg-white/50 dark:bg-gray-800/50 border-purple-100 dark:border-gray-700 min-h-[44px]"
            dir="rtl"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-gray-600 dark:text-gray-400 min-w-fit">שעות</Label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            min="0"
            value={hours}
            onChange={handleHoursChange}
            className="w-full sm:w-20 text-right bg-white/50 dark:bg-gray-800/50 border-purple-100 dark:border-gray-700 min-h-[44px]"
            dir="rtl"
          />
        </div>
      </div>
    </motion.form>
  );
};

export default TaskForm;
