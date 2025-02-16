
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Edit2, Check, X, FileText, Loader2, Upload, Download } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Json } from "@/integrations/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface TableRowProps {
  columns: Array<{ id: string; name: string }>;
  data?: Record<string, any>;
  isEditing?: boolean;
  onSave?: (data: Record<string, any>) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

interface TableRowData {
  [key: string]: Json;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
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
  const [dragActive, setDragActive] = useState(false);
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleFileUpload(file);
    }
  };

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

  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      toast({
        title: "שגיאה",
        description: "לא נבחר קובץ",
        variant: "destructive",
      });
      return;
    }

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
      const updatedData = {
        ...data,
        _file: file
      };

      await onSave?.(updatedData);
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

  const handleRemoveFile = async (fileIndex: number) => {
    try {
      const currentAttachments = [...(data.attachments || [])];
      currentAttachments.splice(fileIndex, 1);
      
      const updatedData = {
        ...data,
        attachments: currentAttachments
      };
      
      await onSave?.(updatedData);
      
      toast({
        title: "הקובץ הוסר",
        description: "הקובץ הוסר בהצלחה",
      });
    } catch (error) {
      console.error('Error removing file:', error);
      toast({
        title: "שגיאה בהסרת הקובץ",
        description: "אירעה שגיאה בעת הסרת הקובץ",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      <TableCell className="text-right min-w-[200px] relative">
        {!isEditing ? (
          <div className="flex flex-col gap-2">
            {(data.attachments || []).map((attachment: { name: string; url: string; size: number; type: string }, index: number) => (
              <div key={index} className="flex items-center justify-between gap-2 group/item bg-muted/40 p-2 rounded-lg">
                <div className="flex flex-col flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 flex-shrink-0 text-blue-500" />
                    <span className="truncate text-sm font-medium">{attachment.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{formatFileSize(attachment.size)}</span>
                    <span>•</span>
                    <span>PDF</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-background rounded-md transition-colors"
                  >
                    <Download className="h-4 w-4 text-blue-500" />
                  </a>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 opacity-0 group-hover/item:opacity-100 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 rounded-md transition-all"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="text-right">
                      <AlertDialogHeader>
                        <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                        <AlertDialogDescription>
                          האם אתה בטוח שברצונך למחוק את הקובץ? פעולה זו היא בלתי הפיכה.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-row-reverse sm:justify-start">
                        <AlertDialogAction onClick={() => handleRemoveFile(index)}>
                          כן, מחק
                        </AlertDialogAction>
                        <AlertDialogCancel>ביטול</AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg transition-all",
              dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25",
              "relative cursor-pointer hover:border-primary hover:bg-primary/5"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById(`file-${data.id || 'new'}`)?.click()}
          >
            <input
              type="file"
              id={`file-${data.id || 'new'}`}
              className="hidden"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">מעלה קובץ...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <div className="text-center">
                  <span className="text-sm font-medium">גרור קובץ לכאן או</span>
                  <span className="text-sm text-primary mx-1">לחץ לבחירה</span>
                </div>
                <span className="text-xs text-muted-foreground">PDF בלבד</span>
              </div>
            )}
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
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </motion.tr>
  );
}
