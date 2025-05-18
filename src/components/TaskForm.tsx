
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TaskPriority } from "@/types/task";
import { motion } from "framer-motion";
import { Check, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface TaskFormProps {
  onAddTask: (title: string, duration: number, priority: TaskPriority) => void;
  initialTitle?: string;
  initialDuration?: number;
  initialPriority?: TaskPriority;
  submitLabel?: string;
  onCancel?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const TaskForm = ({ 
  onAddTask, 
  initialTitle = "", 
  initialDuration = 0, 
  initialPriority = "normal",
  submitLabel = "הוסף",
  onCancel,
  isOpen = false,
  onOpenChange,
}: TaskFormProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [duration, setDuration] = useState(initialDuration);
  const [priority, setPriority] = useState<TaskPriority>(initialPriority);
  const [expanded, setExpanded] = useState(isOpen);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  // Sync expanded state with isOpen prop
  useEffect(() => {
    setExpanded(isOpen);
  }, [isOpen]);
  
  // Notify parent component when expanded state changes
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(expanded);
    }
  }, [expanded, onOpenChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask(title, duration || 0, priority || "normal");
      setTitle("");
      setDuration(0);
      setPriority("normal");
      setExpanded(false);
    }
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setExpanded(false);
      setTitle(initialTitle);
      setDuration(initialDuration);
      setPriority(initialPriority);
    }
  };

  // Focus title input when form expands
  useEffect(() => {
    if (expanded && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [expanded]);

  const priorityDisplayName = {
    low: "נמוכה",
    normal: "רגילה",
    high: "גבוהה",
  };

  return (
    <div className="w-full">
      {!expanded ? (
        <Button 
          onClick={() => setExpanded(true)}
          className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-300 font-medium flex items-center gap-2 text-lg mb-2 border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-all"
          size={isMobile ? "lg" : "default"}
        >
          <Plus className="h-5 w-5" /> הוסף משימה חדשה
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="shadow-md rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          <form onSubmit={handleSubmit} className="p-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="title" className="text-right font-medium">
                  כותרת
                </Label>
                <Input
                  ref={titleInputRef}
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="מה צריך לעשות?"
                  className="text-right"
                  autoComplete="off"
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-2">
                <Label htmlFor="duration" className="text-right font-medium">
                  משך זמן (דקות)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min={0}
                  step={5}
                  className="text-right"
                />
              </div>
              
              <div className="flex flex-col space-y-2">
                <Label htmlFor="priority" className="text-right font-medium">
                  עדיפות
                </Label>
                <Select 
                  value={priority} 
                  onValueChange={(value) => setPriority(value as TaskPriority)}
                >
                  <SelectTrigger id="priority" className="w-full text-right">
                    <SelectValue placeholder="בחר עדיפות" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="w-full">
                    <SelectItem value="low" className="text-right">
                      <div className="flex items-center gap-2 w-full justify-end">
                        <span>נמוכה</span>
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      </div>
                    </SelectItem>
                    <SelectItem value="normal" className="text-right">
                      <div className="flex items-center gap-2 w-full justify-end">
                        <span>רגילה</span>
                        <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high" className="text-right">
                      <div className="flex items-center gap-2 w-full justify-end">
                        <span>גבוהה</span>
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between pt-2 gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center gap-1 border border-gray-300 dark:border-gray-600"
                >
                  <X className="h-4 w-4" />
                  <span>{onCancel ? "בטל" : "סגור"}</span>
                </Button>
                <Button 
                  type="submit" 
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1",
                    priority === "low" && "bg-green-600 hover:bg-green-700",
                    priority === "normal" && "bg-yellow-600 hover:bg-yellow-700",
                    priority === "high" && "bg-red-600 hover:bg-red-700"
                  )}
                >
                  <Check className="h-4 w-4" />
                  <span>{submitLabel}</span>
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default TaskForm;
