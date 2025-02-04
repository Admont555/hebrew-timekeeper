import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface TaskFiltersProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  showArchived: boolean;
  onShowArchivedChange: (show: boolean) => void;
}

const TaskFilters = ({ selectedDate, onDateChange, showArchived, onShowArchivedChange }: TaskFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
      <div className="flex items-center gap-2">
        <Label htmlFor="date-picker" className="min-w-24">תאריך:</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start text-right">
              <CalendarIcon className="ml-2 h-4 w-4" />
              {format(selectedDate, "P", { locale: he })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateChange(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="show-archived" className="min-w-24">הצג משימות שהושלמו:</Label>
        <Switch
          id="show-archived"
          checked={showArchived}
          onCheckedChange={onShowArchivedChange}
        />
      </div>
    </div>
  );
};

export default TaskFilters;