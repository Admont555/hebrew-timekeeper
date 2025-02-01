import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface TableRowProps {
  columns: Array<{ id: string; name: string }>;
  data?: Record<string, string>;
  isEditing?: boolean;
  onSave?: (data: Record<string, string>) => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

export function TableRow({
  columns,
  data = {},
  isEditing = false,
  onSave,
  onCancel,
  onDelete,
}: TableRowProps) {
  const [rowData, setRowData] = useState<Record<string, string>>(data);

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="group hover:bg-muted/50"
    >
      {columns.map((column) => (
        <TableCell key={column.id} className="min-w-[200px]">
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
            />
          ) : (
            <span>{data[column.id] || "-"}</span>
          )}
        </TableCell>
      ))}
      <TableCell className="text-center sticky right-0 bg-background min-w-[100px]">
        {isEditing ? (
          <div className="space-x-2">
            <Button onClick={handleSave} size="sm" variant="outline">
              שמור
            </Button>
            <Button onClick={onCancel} size="sm" variant="ghost">
              ביטול
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </motion.tr>
  );
}