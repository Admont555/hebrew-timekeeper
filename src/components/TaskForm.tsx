import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskPriority } from "@/types/task";

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

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="flex flex-col gap-4 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-2">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="הוסף משימה חדשה..."
          className="text-right bg-white/50 dark:bg-gray-800/50 border-purple-100 dark:border-gray-700 focus:border-purple-500 transition-colors duration-200"
        />
        <Button 
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
        >
          {submitLabel}
        </Button>
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-purple-200 hover:bg-purple-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            ביטול
          </Button>
        )}
      </div>
      <div className="flex gap-4 justify-end items-center">
        <div className="flex items-center gap-2">
          <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="עדיפות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">נמוכה</SelectItem>
              <SelectItem value="normal">רגילה</SelectItem>
              <SelectItem value="high">גבוהה</SelectItem>
            </SelectContent>
          </Select>
          <Label className="text-gray-600 dark:text-gray-400">עדיפות</Label>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-20 text-right bg-white/50 dark:bg-gray-800/50 border-purple-100 dark:border-gray-700"
          />
          <Label className="text-gray-600 dark:text-gray-400">דקות</Label>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-20 text-right bg-white/50 dark:bg-gray-800/50 border-purple-100 dark:border-gray-700"
          />
          <Label className="text-gray-600 dark:text-gray-400">שעות</Label>
        </div>
      </div>
    </motion.form>
  );
};

export default TaskForm;