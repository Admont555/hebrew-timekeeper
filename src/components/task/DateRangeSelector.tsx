import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRangeSelectorProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

const DateRangeSelector = ({ date, onDateChange }: DateRangeSelectorProps) => {
  return (
    <div className="w-full max-w-sm mx-auto mb-8 px-4 sm:px-0">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-12 px-6 relative glass hover:glass-dark transition-all duration-300",
              "flex items-center justify-between gap-2 rounded-xl border border-white/20",
              "text-lg font-medium shadow-lg hover:shadow-xl",
              !date && "text-muted-foreground"
            )}
          >
            <span className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5" />
              {date ? format(date, "PPP") : "בחר תאריך"}
            </span>
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 border border-white/20 rounded-xl shadow-2xl backdrop-blur-lg bg-white/80 dark:bg-gray-900/80" 
          align="center"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            initialFocus
            className="rounded-xl"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeSelector;