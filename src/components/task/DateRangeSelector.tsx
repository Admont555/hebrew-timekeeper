
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
import { useIsMobile } from "@/hooks/use-mobile";

interface DateRangeSelectorProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

const DateRangeSelector = ({ date, onDateChange }: DateRangeSelectorProps) => {
  const isMobile = useIsMobile();
  
  const handlePreviousDay = () => {
    if (date) {
      const newDate = subDays(date, 1);
      onDateChange(newDate);
    } else {
      onDateChange(new Date()); // If no date is selected, start from today
    }
  };

  const handleNextDay = () => {
    if (date) {
      const newDate = addDays(date, 1);
      onDateChange(newDate);
    } else {
      onDateChange(new Date()); // If no date is selected, start from today
    }
  };

  const today = new Date();
  
  // Format date differently for mobile
  const dateFormat = isMobile ? "d בMMMM" : "EEEE, d בMMMM yyyy";

  return (
    <div className="w-full max-w-xl mx-auto mb-8 px-4 sm:px-0" dir="rtl">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextDay}
          className="glass hover:glass-dark transition-all duration-300"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-10 sm:h-12 px-3 sm:px-6 relative glass hover:glass-dark transition-all duration-300",
                "flex items-center justify-between gap-2 rounded-xl border border-white/20",
                "text-sm sm:text-lg font-medium shadow-lg hover:shadow-xl",
                !date && "text-muted-foreground"
              )}
            >
              <span className="flex items-center gap-2 sm:gap-3 truncate">
                <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">
                  {date ? format(date, dateFormat, { locale: he }) : format(today, dateFormat, { locale: he })}
                </span>
              </span>
              
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 border border-white/20 rounded-xl shadow-2xl backdrop-blur-lg bg-white/80 dark:bg-gray-900/80" 
            align="center"
            dir="rtl"
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
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DateRangeSelector;
