import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type ViewMode = "week" | "month" | "all";

interface DateRangeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const DateRangeSelector = ({ viewMode, onViewModeChange }: DateRangeSelectorProps) => {
  const options: { mode: ViewMode; label: string; description: string }[] = [
    { mode: "week", label: "השבוע", description: "משימות לשבוע הנוכחי" },
    { mode: "month", label: "החודש", description: "משימות לחודש הנוכחי" },
    { mode: "all", label: "הכל", description: "כל המשימות" },
  ];

  return (
    <div className="flex flex-col items-center gap-3 mb-6" dir="rtl">
      <div className="flex p-1 bg-card/70 backdrop-blur-md rounded-2xl border border-border/40 shadow-xl">
        {options.map((opt) => {
          const active = viewMode === opt.mode;
          return (
            <motion.button
              key={opt.mode}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => onViewModeChange(opt.mode)}
              className={cn(
                "relative px-5 sm:px-7 py-2.5 rounded-xl text-sm font-semibold transition-colors min-w-[80px]",
                active
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="dateScopePill"
                  className="absolute inset-0 rounded-xl bg-primary shadow-[0_0_24px_hsl(var(--primary)/0.45)]"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{opt.label}</span>
            </motion.button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground tracking-wide">
        {options.find(o => o.mode === viewMode)?.description}
      </p>
    </div>
  );
};

export default DateRangeSelector;
