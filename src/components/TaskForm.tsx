
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
      const totalMinutes = (parseInt(hours) * 60) + parseInt(minutes);
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
          <div className="relative flex-grow">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="הוסף משימה חדשה..."
              className="text-right pr-4 pl-12 bg-white/50 dark:bg-gray-800/50 border-purple-100 dark:border-gray-700 focus:border-purple-500 transition-colors duration-200"
              dir="rtl"
            />
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <VoiceInput onTranscription={handleVoiceInput} />
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button 
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 transition-colors duration-200 w-full sm:w-auto"
          >
            {submitLabel}
          </Button>
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-purple-200 hover:bg-purple-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200 w-full sm:w-auto"
            >
              ביטול
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-gray-600 dark:text-gray-400 whitespace-nowrap">עדיפות</Label>
          <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
            <SelectTrigger className="w-full sm:w-32 text-right">
              <SelectValue placeholder="עדיפות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">נמוכה</SelectItem>
              <SelectItem value="normal">רגילה</SelectItem>
              <SelectItem value="high">גבוהה</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-gray-600 dark:text-gray-400 whitespace-nowrap">דקות</Label>
          <Input
            type="number"
            min="0"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-20 text-right bg-white/50 dark:bg-gray-800/50 border-purple-100 dark:border-gray-700"
            dir="rtl"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-gray-600 dark:text-gray-400 whitespace-nowrap">שעות</Label>
          <Input
            type="number"
            min="0"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-20 text-right bg-white/50 dark:bg-gray-800/50 border-purple-100 dark:border-gray-700"
            dir="rtl"
          />
        </div>
      </div>
    </motion.form>
  );
};

export default TaskForm;
