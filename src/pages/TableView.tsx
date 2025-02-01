import { useState, useEffect } from "react";
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
import { Plus, FileText, Download } from "lucide-react";
import { TableHeader as CustomTableHeader } from "@/components/table/TableHeader";
import { TableRow as CustomTableRow } from "@/components/table/TableRow";
import { AnimatePresence, motion } from "framer-motion";
import type { Json } from "@/integrations/supabase/types";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

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

  const handleExportPDF = async () => {
    const tableElement = document.getElementById('table-to-export');
    if (!tableElement) return;

    try {
      const canvas = await html2canvas(tableElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        direction: 'rtl'
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add title with RTL support
      pdf.setR2L(true);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(16);
      
      const title = table?.name || 'טבלה';
      const currentDate = format(new Date(), 'PP', { locale: he });
      
      // Calculate text width to position from right
      const titleWidth = pdf.getStringUnitWidth(title) * 16 / pdf.internal.scaleFactor;
      const dateWidth = pdf.getStringUnitWidth(currentDate) * 12 / pdf.internal.scaleFactor;
      
      // Add title and date
      pdf.text(title, pdf.internal.pageSize.width - 20 - titleWidth, 20);
      pdf.setFontSize(12);
      pdf.text(currentDate, pdf.internal.pageSize.width - 20 - dateWidth, 30);

      // Add the table image
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        20,
        40,
        imgWidth,
        imgHeight
      );

      pdf.save(`${table?.name || 'table'}-${currentDate}.pdf`);

      toast({
        title: "PDF יוצא בהצלחה",
        description: "הקובץ נשמר במחשב שלך",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "שגיאה ביצירת ה-PDF",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = () => {
    // Prepare the data for Excel
    const excelData = rows.map(row => {
      const rowData: Record<string, string> = {};
      columns.forEach(col => {
        rowData[col.name] = String(row.data[col.id] || '');
      });
      return rowData;
    });
    
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Save the file
    XLSX.writeFile(wb, `${table?.name || 'table'}-export.xlsx`);
    
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

  const editRowMutation = useMutation({
    mutationFn: async ({ rowId, data }: { rowId: string; data: Record<string, string> }) => {
      const { error } = await supabase
        .from("table_rows")
        .update({ data })
        .eq("id", rowId);
      if (error) throw error;
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
      toast({
        title: "שגיאה בעדכון השורה",
        description: error.message,
        variant: "destructive",
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
    
    const aValue = a.data[sortConfig.column]?.toLowerCase() || '';
    const bValue = b.data[sortConfig.column]?.toLowerCase() || '';
    
    if (sortConfig.direction === 'asc') {
      return aValue.localeCompare(bValue);
    }
    return bValue.localeCompare(aValue);
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

  return (
    <div className="container mx-auto p-6 min-h-screen bg-background/50" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold mb-2">{table?.name}</h1>
          <p className="text-muted-foreground">נהל את הטבלה שלך</p>
        </motion.div>

        <Card>
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
          <ScrollArea className="h-[700px] w-full rounded-md border">
            <div className="relative">
              <div className="overflow-x-auto" id="table-to-export">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
                        <TableHead 
                          key={column.id} 
                          className="text-right whitespace-nowrap min-w-[200px] cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort(column.id)}
                        >
                          <div className="flex items-center justify-between">
                            {sortConfig.column === column.id && (
                              <span className="text-primary">
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                            <span>{column.name}</span>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="text-center sticky right-0 bg-background min-w-[100px]">
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
                          onSave={(data) => editRowMutation.mutate({ rowId: row.id, data })}
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
                          <TableCell colSpan={columns.length + 1} className="text-center">
                            <Button
                              onClick={() => setIsAddingRow(true)}
                              variant="outline"
                              size="sm"
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
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            ייצא ל-PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleExportExcel}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            ייצא ל-Excel
          </Button>
        </div>
      </div>
    </div>
  );
}
