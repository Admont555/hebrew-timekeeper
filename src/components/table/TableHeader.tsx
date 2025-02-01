import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, SortAsc, SortDesc } from "lucide-react";
import { useState } from "react";

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

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    onAddColumn(newColumnName);
    setNewColumnName("");
  };

  return (
    <div className="space-y-4 p-4" dir="rtl">
      <div className="flex items-center gap-4">
        <form onSubmit={handleAddColumn} className="flex gap-4 flex-1">
          <Input
            placeholder="שם העמודה החדשה"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            className="max-w-[200px] text-right"
            dir="rtl"
          />
          <Button type="submit" disabled={!newColumnName.trim()} size="sm">
            <Plus className="ml-2 h-4 w-4" /> הוסף עמודה
          </Button>
        </form>
        <div className="flex items-center gap-2">
          <Input
            placeholder="חיפוש..."
            onChange={(e) => onSearch(e.target.value)}
            className="max-w-[200px] text-right"
            dir="rtl"
          />
          <Search className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
}