
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download, ArrowLeft, Paperclip } from "lucide-react";
import { TableHeader as CustomTableHeader } from "@/components/table/TableHeader";
import { TableRow as CustomTableRow } from "@/components/table/TableRow";
import { AnimatePresence, motion } from "framer-motion";
import type { Json } from "@/integrations/supabase/types";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export default function TableView() {
  const { tableId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    column?: string;
    direction: 'asc' | 'desc';
  }>({ direction: 'asc' });
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: table } = useQuery({
    queryKey: ["tables", tableId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tables")
        .select("*")
        .eq("id", tableId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: columns = [] } = useQuery({
    queryKey: ["table-columns", tableId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("table_columns")
        .select("*")
        .eq("table_id", tableId)
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  const { data: rows = [] } = useQuery({
    queryKey: ["table-rows", tableId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("table_rows")
        .select("*")
        .eq("table_id", tableId);
      if (error) throw error;
      return data;
    },
  });

  const handleFileUpload = async (file: File, rowId: string) => {
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${rowId}/${timestamp}.${fileExt}`;

    // First, make sure the file extension exists
    if (!fileExt) {
      toast({
        title: "שגיאה בהעלאת הקובץ",
        description: "סוג הקובץ לא תקין",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('table-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "שגיאה בהעלאת הקובץ",
          description: uploadError.message,
          variant: "destructive",
        });
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('table-attachments')
        .getPublicUrl(fileName);

      return {
        name: file.name,
        url: publicUrl,
        type: file.type,
        size: file.size,
      };
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "שגיאה בהעלאת הקובץ",
        description: "אירעה שגיאה בעת העלאת הקובץ",
        variant: "destructive",
      });
      return null;
    }
  };

  const editTaskMutation = useMutation({
    mutationFn: async ({ rowId, data }: { rowId: string; data: Record<string, any> }) => {
      if (data._file) {
        const attachment = await handleFileUpload(data._file, rowId);
        if (attachment) {
          const { data: currentRow, error: fetchError } = await supabase
            .from('table_rows')
            .select('data')
            .eq('id', rowId)
            .single();

          if (fetchError) {
            console.error('Fetch error:', fetchError);
            throw fetchError;
          }

          if (!currentRow) throw new Error('Row not found');

          const currentData = typeof currentRow.data === 'object' ? currentRow.data : {};
          const currentAttachments = Array.isArray((currentData as any).attachments) 
            ? (currentData as any).attachments 
            : [];

          const { error: updateError } = await supabase
            .from('table_rows')
            .update({
              data: {
                ...(typeof currentData === 'object' ? currentData : {}),
                attachments: [...currentAttachments, attachment]
              }
            })
            .eq('id', rowId);

          if (updateError) {
            console.error('Update error:', updateError);
            throw updateError;
          }
        }
      } else {
        const { error } = await supabase
          .from('table_rows')
          .update({ data })
          .eq('id', rowId);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-rows", tableId] });
      setEditingRowId(null);
      toast({
        title: "השורה עודכנה",
        description: "השורה עודכנה בהצלחה",
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "שגיאה בעדכון השורה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExportPDF = async () => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    try {
      const contentContainer = document.createElement('div');
      contentContainer.style.width = '100%';
      contentContainer.style.padding = '20px';
      contentContainer.style.direction = 'rtl';
      contentContainer.style.backgroundColor = '#ffffff';
      container.appendChild(contentContainer);
      
      const header = document.createElement('div');
      header.style.marginBottom = '20px';
      header.style.textAlign = 'center';
      
      const title = document.createElement('h1');
      title.textContent = table?.name || 'טבלה';
      title.style.fontSize = '24px';
      title.style.marginBottom = '8px';
      title.style.fontFamily = 'Arial, sans-serif';
      title.style.color = '#000000';
      
      const date = document.createElement('div');
      date.textContent = format(new Date(), 'PP', { locale: he });
      date.style.fontSize = '14px';
      date.style.color = '#000000';
      
      header.appendChild(title);
      header.appendChild(date);
      contentContainer.appendChild(header);

      const tableElement = document.querySelector('table');
      if (!tableElement) {
        throw new Error('Table element not found');
      }
      
      const tableClone = tableElement.cloneNode(true) as HTMLElement;
      
      const actionCells = tableClone.querySelectorAll('th:last-child, td:last-child');
      actionCells.forEach(cell => cell.remove());
      
      const styles = document.createElement('style');
      styles.textContent = `
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-family: Arial, sans-serif;
          color: #000000;
        }
        th, td {
          border: 1px solid #000000;
          padding: 12px;
          text-align: right;
          color: #000000;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #ffffff;
        }
        tr:nth-child(odd) {
          background-color: #f8f9fa;
        }
      `;
      
      contentContainer.appendChild(styles);
      contentContainer.appendChild(tableClone);

      const canvas = await html2canvas(contentContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      const imgWidth = pdfWidth - (2 * margin);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(
        imgData,
        'PNG',
        margin,
        margin,
        imgWidth,
        Math.min(imgHeight, pdfHeight - (2 * margin)),
        undefined,
        'FAST'
      );

      const fileName = `${table?.name || 'table'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);

      toast({
        title: "הייצוא הושלם בהצלחה",
        description: "הקובץ נשמר במחשב שלך",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "שגיאה בייצוא הקובץ",
        description: "אירעה שגיאה בעת ייצוא הקובץ. אנא נסה שוב",
        variant: "destructive",
      });
    } finally {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  };

  const handleExportExcel = () => {
    const excelData = rows.map(row => {
      const rowData: Record<string, string> = {};
      columns.forEach(col => {
        rowData[col.name] = String(row.data[col.id] || '');
      });
      return rowData;
    });
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    XLSX.writeFile(wb, `${table?.name || 'table'}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    
    toast({
      title: "Excel יוצא בהצלחה",
      description: "הקובץ נשמר במחשב שלך",
    });
  };

  const addColumnMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("table_columns")
        .insert([
          {
            table_id: tableId,
            name,
            order_index: columns.length,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-columns", tableId] });
      toast({
        title: "העמודה נוספה",
        description: "העמודה החדשה נוספה בהצלחה",
      });
    },
  });

  const addRowMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const { data: newRow, error } = await supabase
        .from("table_rows")
        .insert([
          {
            table_id: tableId,
            data,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return newRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-rows", tableId] });
      setIsAddingRow(false);
      toast({
        title: "השורה נוספה",
        description: "השורה החדשה נוספה בהצלחה",
      });
    },
  });

  const deleteColumnMutation = useMutation({
    mutationFn: async (columnId: string) => {
      const { error } = await supabase
        .from("table_columns")
        .delete()
        .eq("id", columnId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-columns", tableId] });
      toast({
        title: "העמודה נמחקה",
        description: "העמודה נמחקה בהצלחה",
      });
    },
  });

  const deleteRowMutation = useMutation({
    mutationFn: async (rowId: string) => {
      const { error } = await supabase
        .from("table_rows")
        .delete()
        .eq("id", rowId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-rows", tableId] });
      toast({
        title: "השורה נמחקה",
        description: "השורה נמחקה בהצלחה",
      });
    },
  });

  const handleSort = (columnId: string) => {
    setSortConfig(current => ({
      column: columnId,
      direction: current.column === columnId && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredRows = rows.filter(row => 
    Object.values(row.data).some(value => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortConfig.column) return 0;
    
    const aValue = a.data[sortConfig.column]?.toString().toLowerCase() || '';
    const bValue = b.data[sortConfig.column]?.toString().toLowerCase() || '';
    
    if (sortConfig.direction === 'asc') {
      return aValue.localeCompare(bValue, 'he');
    }
    return bValue.localeCompare(aValue, 'he');
  });

  return (
    <div className="container mx-auto p-3 sm:p-6 min-h-screen bg-background/50" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/tables')}
            className="flex items-center gap-2 text-sm sm:text-base"
            size={isMobile ? "sm" : "default"}
          >
            <ArrowLeft className="h-4 w-4" />
            חזרה לטבלאות
          </Button>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-xl sm:text-3xl font-bold mb-2">{table?.name}</h1>
            <p className="text-muted-foreground text-sm sm:text-base">נהל את הטבלה שלך</p>
          </motion.div>
        </div>

        <Card className="overflow-hidden">
          <CustomTableHeader
            columns={columns}
            onAddColumn={(name) => addColumnMutation.mutate(name)}
            onSort={handleSort}
            onSearch={handleSearch}
            sortColumn={sortConfig.column}
            sortDirection={sortConfig.direction}
          />
        </Card>

        <Card className="overflow-hidden">
          <ScrollArea className="h-[600px] sm:h-[700px] w-full rounded-md border">
            <div className="relative">
              <div className="overflow-x-auto" id="table-to-export">
                <Table dir="rtl">
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
                        <TableHead 
                          key={column.id} 
                          className="text-right whitespace-nowrap min-w-[150px] sm:min-w-[200px] cursor-pointer hover:bg-muted/50 p-4"
                          onClick={() => handleSort(column.id)}
                          style={{ textAlign: 'right' }}
                        >
                          <div className="flex items-center justify-end gap-2 w-full text-right">
                            <span className="flex-1 text-right">{column.name}</span>
                            {sortConfig.column === column.id && (
                              <span className="text-primary flex-shrink-0">
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="text-right whitespace-nowrap min-w-[100px]">
                        קבצים מצורפים
                      </TableHead>
                      <TableHead className="text-center sticky left-0 bg-background min-w-[100px]">
                        פעולות
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {sortedRows.map((row) => (
                        <CustomTableRow
                          key={row.id}
                          columns={columns}
                          data={Object.fromEntries(
                            Object.entries(row.data as Record<string, string>)
                          )}
                          isEditing={editingRowId === row.id}
                          onEdit={() => setEditingRowId(row.id)}
                          onSave={(data) => editTaskMutation.mutate({ rowId: row.id, data })}
                          onCancel={() => setEditingRowId(null)}
                          onDelete={() => deleteRowMutation.mutate(row.id)}
                        />
                      ))}
                      {isAddingRow && (
                        <CustomTableRow
                          columns={columns}
                          isEditing
                          onSave={(data) => {
                            addRowMutation.mutate(data);
                            setIsAddingRow(false);
                          }}
                          onCancel={() => setIsAddingRow(false)}
                        />
                      )}
                      {!isAddingRow && (
                        <TableRow>
                          <TableCell colSpan={columns.length + 2} className="text-center p-4">
                            <Button
                              onClick={() => setIsAddingRow(true)}
                              variant="outline"
                              size={isMobile ? "sm" : "default"}
                              className="w-full sm:w-auto"
                            >
                              <Plus className="ml-2 h-4 w-4" /> הוסף שורה
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Card>

        <div className="flex justify-end gap-4 mt-4">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="flex items-center gap-2 text-sm sm:text-base"
            size={isMobile ? "sm" : "default"}
          >
            <FileText className="h-4 w-4" />
            ייצא ל-PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleExportExcel}
            className="flex items-center gap-2 text-sm sm:text-base"
            size={isMobile ? "sm" : "default"}
          >
            <Download className="h-4 w-4" />
            ייצא ל-Excel
          </Button>
        </div>
      </div>
    </div>
  );
}
