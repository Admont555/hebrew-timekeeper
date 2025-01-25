import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ArrowLeft, ArrowRight } from "lucide-react";
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
    <div className="w-full max-w-xl mx-auto mb-8 px-4 sm:px-0">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextDay}
          className="glass hover:glass-dark transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
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
                {date ? format(date, "EEEE, d בMMMM yyyy", { locale: he }) : "בחר תאריך"}
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
              locale={he}
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousDay}
          className="glass hover:glass-dark transition-all duration-300"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DateRangeSelector;