import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TaskPriority } from "@/types/task";

interface TaskFiltersProps {
  priority: TaskPriority | 'all';
  onPriorityChange: (value: TaskPriority | 'all') => void;
  sortBy: 'date' | 'priority' | 'duration';
  onSortChange: (value: 'date' | 'priority' | 'duration') => void;
}

const TaskFilters = ({ priority, onPriorityChange, sortBy, onSortChange }: TaskFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Label htmlFor="priority-filter" className="min-w-24">סנן לפי עדיפות:</Label>
        <Select
          value={priority}
          onValueChange={(value: TaskPriority | 'all') => onPriorityChange(value)}
        >
          <SelectTrigger id="priority-filter" className="w-[180px]">
            <SelectValue placeholder="כל העדיפויות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל</SelectItem>
            <SelectItem value="high">דחוף</SelectItem>
            <SelectItem value="normal">רגיל</SelectItem>
            <SelectItem value="low">נמוך</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="sort-by" className="min-w-24">מיין לפי:</Label>
        <Select
          value={sortBy}
          onValueChange={(value: 'date' | 'priority' | 'duration') => onSortChange(value)}
        >
          <SelectTrigger id="sort-by" className="w-[180px]">
            <SelectValue placeholder="מיין לפי" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">תאריך</SelectItem>
            <SelectItem value="priority">עדיפות</SelectItem>
            <SelectItem value="duration">משך זמן</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TaskFilters;