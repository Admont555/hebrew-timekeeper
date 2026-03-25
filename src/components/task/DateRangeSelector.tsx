import { Button } from "@/components/ui/button";
import { CalendarDays, CalendarRange, Infinity as InfinityIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type ViewMode = "week" | "month" | "all";

interface DateRangeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const DateRangeSelector = ({ viewMode, onViewModeChange }: DateRangeSelectorProps) => {
  const options: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: "week", label: "שבוע", icon: <CalendarDays className="h-4 w-4" /> },
    { mode: "month", label: "חודש", icon: <CalendarRange className="h-4 w-4" /> },
    { mode: "all", label: "הכל", icon: <InfinityIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-6" dir="rtl">
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm">
        {options.map((opt) => (
          <motion.div key={opt.mode} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange(opt.mode)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                viewMode === opt.mode
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DateRangeSelector;
