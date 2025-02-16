
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface TableRowProps {
  columns: Array<{ id: string; name: string }>;
  data?: Record<string, string>;
  isEditing?: boolean;
  onSave?: (data: Record<string, string>) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function TableRow({
  columns,
  data = {},
  isEditing = false,
  onSave,
  onCancel,
  onDelete,
  onEdit,
}: TableRowProps) {
  const [rowData, setRowData] = useState<Record<string, string>>(data);
  const [isHovered, setIsHovered] = useState(false);
  const rowRef = useRef<HTMLTableRowElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rowRef.current && !rowRef.current.contains(event.target as Node) && isEditing) {
        onCancel?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, onCancel]);

  const handleSave = () => {
    const hasAtLeastOneValue = columns.some(column => rowData[column.id]?.trim());
    if (!hasAtLeastOneValue) {
      toast({
        title: "שגיאה",
        description: "יש למלא לפחות שדה אחד",
        variant: "destructive",
      });
      return;
    }
    onSave?.(rowData);
  };

  return (
    <motion.tr
      ref={rowRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="group hover:bg-muted/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      dir="rtl"
    >
      {columns.map((column) => (
        <TableCell 
          key={column.id} 
          className="text-right cursor-pointer min-w-[150px] sm:min-w-[200px]"
          onClick={() => !isEditing && onEdit?.()}
        >
          {isEditing ? (
            <Input
              placeholder={`ערך ל${column.name}`}
              value={rowData[column.id] || ""}
              onChange={(e) =>
                setRowData((prev) => ({
                  ...prev,
                  [column.id]: e.target.value,
                }))
              }
              className="text-right"
              dir="rtl"
              size={isMobile ? 16 : undefined}
            />
          ) : (
            <span className="block w-full hover:bg-muted/50 p-2 rounded transition-colors text-right">
              {data[column.id] || "-"}
            </span>
          )}
        </TableCell>
      ))}
      <TableCell className="text-center sticky left-0 bg-background min-w-[100px]">
        {isEditing ? (
          <div className="flex justify-center gap-2">
            <Button 
              onClick={handleSave} 
              size="icon"
              variant="ghost"
              className="h-8 w-8"
            >
              <Check className="h-4 w-4 text-green-500" />
            </Button>
            <Button 
              onClick={onCancel} 
              size="icon"
              variant="ghost"
              className="h-8 w-8"
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </motion.tr>
  );
}
