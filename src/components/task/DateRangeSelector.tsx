import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { addDays, subDays } from "date-fns";

interface DateRangeSelectorProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

const DateRangeSelector = ({ date, onDateChange }: DateRangeSelectorProps) => {
  const handlePreviousDay = () => {
    if (date) {
      onDateChange(subDays(date, 1));
    }
  };

  const handleNextDay = () => {
    if (date) {
      onDateChange(addDays(date, 1));
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 max-w-md mx-auto mb-4">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousDay}
        className="glass hover:glass-dark transition-all duration-300"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-10 px-4 relative glass hover:glass-dark transition-all duration-300",
              "flex items-center justify-between gap-2 rounded-xl border border-white/20",
              "text-sm font-medium shadow-lg hover:shadow-xl",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            {date ? format(date, "EEEE, d/M", { locale: he }) : "בחר תאריך"}
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
            locale={he}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNextDay}
        className="glass hover:glass-dark transition-all duration-300"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DateRangeSelector;