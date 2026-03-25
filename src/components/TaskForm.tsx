import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TaskPriority } from "@/types/task";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, X, Sparkles } from "lucide-react";
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
import { TASK_CATEGORIES } from "@/constants/categories";

interface TaskFormProps {
  onAddTask: (title: string, duration: number, priority: TaskPriority, categoryId?: string) => void;
  initialTitle?: string;
  initialDuration?: number;
  initialPriority?: TaskPriority;
  initialCategoryId?: string;
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
  initialCategoryId = "",
  submitLabel = "הוסף",
  onCancel,
  isOpen = false,
  onOpenChange,
}: TaskFormProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [duration, setDuration] = useState(initialDuration);
  const [priority, setPriority] = useState<TaskPriority>(initialPriority);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [expanded, setExpanded] = useState(isOpen);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setExpanded(isOpen);
    if (isOpen) {
      setTitle(initialTitle);
      setDuration(initialDuration);
      setPriority(initialPriority);
      setCategoryId(initialCategoryId);
    }
  }, [isOpen, initialTitle, initialDuration, initialPriority, initialCategoryId]);
  
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(expanded);
    }
  }, [expanded, onOpenChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask(title, duration || 0, priority || "normal", categoryId || undefined);
      setTitle("");
      setDuration(0);
      setPriority("normal");
      setCategoryId("");
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
      setCategoryId(initialCategoryId);
    }
  };

  useEffect(() => {
    if (expanded && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [expanded]);

  const getPriorityGradient = () => {
    switch (priority) {
      case 'low':
        return 'from-task-low to-emerald-500';
      case 'normal':
        return 'from-task-normal to-amber-500';
      case 'high':
        return 'from-task-high to-rose-500';
      default:
        return 'from-primary to-primary-glow';
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.div
            key="button"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Button 
              onClick={() => setExpanded(true)}
              className={cn(
                "w-full group relative overflow-hidden",
                "bg-gradient-to-r from-primary/10 via-accent/50 to-primary/10",
                "hover:from-primary/20 hover:via-accent hover:to-primary/20",
                "text-primary dark:text-primary font-semibold",
                "flex items-center justify-center gap-3 text-lg mb-3",
                "border-2 border-dashed border-primary/30 hover:border-primary/60",
                "rounded-2xl shadow-sm hover:shadow-lg hover:shadow-primary/10",
                "transition-all duration-300"
              )}
              size={isMobile ? "lg" : "default"}
            >
              <motion.div
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.3 }}
              >
                <Plus className="h-6 w-6" />
              </motion.div>
              <span>הוסף משימה חדשה</span>
              <Sparkles className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative overflow-hidden rounded-2xl shadow-xl border border-border/50 bg-card/98 backdrop-blur-md"
          >
            {/* Decorative gradient header */}
            <div className={cn(
              "h-2 bg-gradient-to-r",
              getPriorityGradient()
            )} />
            
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-right font-medium text-foreground/80">
                  כותרת המשימה
                </Label>
                <Input
                  ref={titleInputRef}
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="מה צריך לעשות?"
                  className="text-right rtl:text-right h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl bg-background/50 transition-all duration-300"
                  style={{ textAlign: 'right', direction: 'rtl' }}
                  autoComplete="off"
                  required
                />
              </div>

              {/* Category selector */}
              <div className="space-y-2">
                <Label className="text-right font-medium text-foreground/80">
                  קטגוריה
                </Label>
                <div className="flex flex-wrap gap-2">
                  {TASK_CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat.id}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCategoryId(categoryId === cat.id ? "" : cat.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                        categoryId === cat.id
                          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                          : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-right font-medium text-foreground/80">
                    משך זמן (דקות)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={0}
                    step={5}
                    className="text-right h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl bg-background/50 transition-all duration-300"
                    style={{ textAlign: 'right', direction: 'rtl' }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-right font-medium text-foreground/80">
                    עדיפות
                  </Label>
                  <Select 
                    value={priority} 
                    onValueChange={(value) => setPriority(value as TaskPriority)}
                  >
                    <SelectTrigger 
                      id="priority" 
                      className="w-full h-12 text-right border-2 border-border/50 focus:border-primary/50 rounded-xl bg-background/50 transition-all duration-300"
                    >
                      <SelectValue placeholder="בחר עדיפות" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="w-full rounded-xl border-2" dir="rtl">
                      <SelectItem value="low" className="text-right rounded-lg">
                        <div className="flex items-center gap-3 w-full justify-end py-1">
                          <span className="font-medium">נמוכה</span>
                          <motion.span 
                            className="h-3 w-3 rounded-full bg-task-low shadow-sm shadow-task-low/50"
                            whileHover={{ scale: 1.2 }}
                          />
                        </div>
                      </SelectItem>
                      <SelectItem value="normal" className="text-right rounded-lg">
                        <div className="flex items-center gap-3 w-full justify-end py-1">
                          <span className="font-medium">רגילה</span>
                          <motion.span 
                            className="h-3 w-3 rounded-full bg-task-normal shadow-sm shadow-task-normal/50"
                            whileHover={{ scale: 1.2 }}
                          />
                        </div>
                      </SelectItem>
                      <SelectItem value="high" className="text-right rounded-lg">
                        <div className="flex items-center gap-3 w-full justify-end py-1">
                          <span className="font-medium">גבוהה</span>
                          <motion.span 
                            className="h-3 w-3 rounded-full bg-task-high animate-pulse shadow-sm shadow-task-high/50"
                            whileHover={{ scale: 1.2 }}
                          />
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleCancel}
                  className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-border/50 hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                  <span className="font-medium">{onCancel ? "בטל" : "סגור"}</span>
                </Button>
                <Button 
                  type="submit" 
                  className={cn(
                    "flex-1 h-12 flex items-center justify-center gap-2 rounded-xl font-medium text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-xl",
                    `bg-gradient-to-r ${getPriorityGradient()}`,
                    "hover:opacity-90"
                  )}
                >
                  <Check className="h-5 w-5" />
                  <span>{submitLabel}</span>
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskForm;
