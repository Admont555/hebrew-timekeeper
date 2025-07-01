import { useState, useEffect } from "react";
import { Search, Filter, X, Calendar, User, FolderOpen, Flag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TaskSearchProps {
  onSearch: (filters: SearchFilters) => void;
  placeholder?: string;
}

export interface SearchFilters {
  text: string;
  priority?: string;
  completed?: boolean;
  worker?: string;
  project?: string;
}

const TaskSearch = ({ onSearch, placeholder = "חיפוש משימות..." }: TaskSearchProps) => {
  const [searchText, setSearchText] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    text: "",
  });

  // Get team members for filter
  const { data: teamMembers } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Get projects for filter
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title')
        .order('title');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      onSearch({ ...filters, text: searchText });
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchText, filters, onSearch]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({ text: "" });
    setSearchText("");
    setIsFilterOpen(false);
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== "" && value !== null
  ).length - 1; // -1 because text is always included

  return (
    <div className="w-full space-y-3">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder={placeholder}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10 text-right"
            dir="rtl"
          />
        </div>
        
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className="relative"
            >
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 text-right" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">סינון מתקדם</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4 ml-1" />
                  נקה הכל
                </Button>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  עדיפות
                </label>
                <Select 
                  value={filters.priority || ""} 
                  onValueChange={(value) => handleFilterChange('priority', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר עדיפות" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">כל העדיפויות</SelectItem>
                    <SelectItem value="high">גבוהה</SelectItem>
                    <SelectItem value="normal">רגילה</SelectItem>
                    <SelectItem value="low">נמוכה</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">סטטוס</label>
                <Select 
                  value={filters.completed === undefined ? "" : filters.completed.toString()} 
                  onValueChange={(value) => handleFilterChange('completed', value === "" ? undefined : value === "true")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סטטוס" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">כל הסטטוסים</SelectItem>
                    <SelectItem value="false">לא הושלמו</SelectItem>
                    <SelectItem value="true">הושלמו</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Worker Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  עובד
                </label>
                <Select 
                  value={filters.worker || ""} 
                  onValueChange={(value) => handleFilterChange('worker', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר עובד" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">כל העובדים</SelectItem>
                    {teamMembers?.map((member) => (
                      <SelectItem key={member.worker_id} value={member.worker_id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  פרויקט
                </label>
                <Select 
                  value={filters.project || ""} 
                  onValueChange={(value) => handleFilterChange('project', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר פרויקט" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">כל הפרויקטים</SelectItem>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.priority && (
            <Badge variant="secondary" className="flex items-center gap-1">
              עדיפות: {filters.priority === 'high' ? 'גבוהה' : filters.priority === 'normal' ? 'רגילה' : 'נמוכה'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('priority', undefined)}
              />
            </Badge>
          )}
          {filters.completed !== undefined && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.completed ? 'הושלמו' : 'לא הושלמו'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('completed', undefined)}
              />
            </Badge>
          )}
          {filters.worker && (
            <Badge variant="secondary" className="flex items-center gap-1">
              עובד: {teamMembers?.find(m => m.worker_id === filters.worker)?.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('worker', undefined)}
              />
            </Badge>
          )}
          {filters.project && (
            <Badge variant="secondary" className="flex items-center gap-1">
              פרויקט: {projects?.find(p => p.id === filters.project)?.title}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('project', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskSearch;