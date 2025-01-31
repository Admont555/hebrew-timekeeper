import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskListHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: 'date' | 'priority' | 'duration';
  setSortBy: (value: 'date' | 'priority' | 'duration') => void;
}

const TaskListHeader = ({ searchTerm, onSearchChange, sortBy, setSortBy }: TaskListHeaderProps) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          id="task-search"
          type="search"
          placeholder="חפש משימות..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4"
          aria-label="חיפוש משימות"
        />
      </div>
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger>
          <SelectValue placeholder="מיין לפי" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">תאריך</SelectItem>
          <SelectItem value="priority">עדיפות</SelectItem>
          <SelectItem value="duration">משך זמן</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TaskListHeader;