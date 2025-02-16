
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TableHeaderProps {
  columns: Array<{ id: string; name: string }>;
  onAddColumn: (name: string) => void;
  onSort: (columnId: string) => void;
  onSearch: (term: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export function TableHeader({
  columns,
  onAddColumn,
  onSort,
  onSearch,
  sortColumn,
  sortDirection,
}: TableHeaderProps) {
  const [newColumnName, setNewColumnName] = useState("");
  const isMobile = useIsMobile();

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    onAddColumn(newColumnName);
    setNewColumnName("");
  };

  return (
    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <form onSubmit={handleAddColumn} className="flex gap-2 sm:gap-4 w-full sm:w-auto">
          <Input
            placeholder="שם העמודה החדשה"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            className="max-w-[200px] text-right"
            dir="rtl"
            size={isMobile ? 16 : undefined}
          />
          <Button 
            type="submit" 
            disabled={!newColumnName.trim()} 
            size={isMobile ? "sm" : "default"}
            className="whitespace-nowrap"
          >
            <Plus className="ml-2 h-4 w-4" /> הוסף עמודה
          </Button>
        </form>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="חיפוש..."
            onChange={(e) => onSearch(e.target.value)}
            className="max-w-[200px] text-right"
            dir="rtl"
            size={isMobile ? 16 : undefined}
          />
          <Search className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
}
