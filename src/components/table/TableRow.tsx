
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Trash2, Edit2, Check, X, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface TableRowProps {
  columns: Array<{ id: string; name: string }>;
  data?: Record<string, any>;
  isEditing?: boolean;
  onSave?: (data: Record<string, any>) => void;
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
  const [rowData, setRowData] = useState<Record<string, any>>(data);
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
    const hasAtLeastOneValue = columns.some(column => rowData[column.id]?.toString().trim());
    if (!hasAtLeastOneValue && !rowData._file) {
      toast({
        title: "שגיאה",
        description: "יש למלא לפחות שדה אחד",
        variant: "destructive",
      });
      return;
    }
    onSave?.(rowData);
  };

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "שגיאה",
        description: "ניתן להעלות קבצי PDF בלבד",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      setRowData(prev => ({
        ...prev,
        _file: file
      }));
      await handleSave();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "שגיאה בהעלאת הקובץ",
        description: "אירעה שגיאה בעת העלאת הקובץ",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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
          className="text-right cursor-pointer min-w-[150px] sm:min-w-[200px] p-4"
          onClick={() => !isEditing && onEdit?.()}
          style={{ textAlign: 'right' }}
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
      <TableCell className="text-right min-w-[100px]">
        {!isEditing ? (
          <div className="flex flex-col gap-1">
            {(data.attachments || []).map((attachment: { name: string; url: string }, index: number) => (
              <a
                key={index}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
              >
                <FileText className="h-4 w-4" />
                <span className="truncate max-w-[150px]">{attachment.name}</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="file"
              id={`file-${data.id}`}
              className="hidden"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById(`file-${data.id}`)?.click()}
              className="w-8 h-8 p-0"
              disabled={isUploading}
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
      <TableCell className="text-center sticky left-0 bg-background min-w-[100px]">
        {isEditing ? (
          <div className="flex justify-center gap-2">
            <Button 
              onClick={handleSave} 
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              disabled={isUploading}
            >
              <Check className="h-4 w-4 text-green-500" />
            </Button>
            <Button 
              onClick={onCancel} 
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              disabled={isUploading}
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
