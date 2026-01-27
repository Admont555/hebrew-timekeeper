import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { addDays, subDays } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
interface DateRangeSelectorProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}
const DateRangeSelector = ({
  date,
  onDateChange
}: DateRangeSelectorProps) => {
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
  return <div className="w-full max-w-xl mx-auto mb-8 px-4 sm:px-0" dir="rtl">
      
    </div>;
};
export default DateRangeSelector;