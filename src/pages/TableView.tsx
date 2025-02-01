import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TableView() {
  const { tableId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newColumnName, setNewColumnName] = useState("");
  const [newRowData, setNewRowData] = useState<Record<string, string>>({});
  const [isAddingRow, setIsAddingRow] = useState(false);

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

  // Fetch columns
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

  // Fetch rows
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

  // Add column mutation
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
      setNewColumnName("");
      toast({
        title: "העמודה נוספה",
        description: "העמודה החדשה נוספה בהצלחה",
      });
    },
  });

  // Add row mutation
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
      setNewRowData({});
      toast({
        title: "השורה נוספה",
        description: "השורה החדשה נוספה בהצלחה",
      });
    },
  });

  // Delete column mutation
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

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    addColumnMutation.mutate(newColumnName);
  };

  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if we have values for all columns
    const hasEmptyValues = columns.some(column => !newRowData[column.id]?.trim());
    
    if (hasEmptyValues) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות לפני שמירה",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(newRowData).length === 0) return;
    
    addRowMutation.mutate(newRowData, {
      onSuccess: () => {
        // Clear only the row data but keep isAddingRow true
        setNewRowData({});
        toast({
          title: "השורה נוספה",
          description: "השורה החדשה נוספה בהצלחה",
        });
      },
    });
  };

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

        <Card className="p-4">
          <form onSubmit={handleAddColumn} className="flex gap-4">
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
        </Card>

        <Card className="overflow-hidden">
          <ScrollArea className="h-[700px] w-full rounded-md border">
            <div className="relative">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
                        <TableHead 
                          key={column.id} 
                          className="text-right whitespace-nowrap min-w-[200px]"
                        >
                          <div className="flex items-center justify-between">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteColumnMutation.mutate(column.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                      {rows.map((row) => (
                        <TableRow key={row.id} className="group hover:bg-muted/50">
                          {columns.map((column) => (
                            <TableCell 
                              key={column.id} 
                              className="text-right whitespace-nowrap min-w-[200px]"
                            >
                              {row.data[column.id] || "-"}
                            </TableCell>
                          ))}
                          <TableCell className="text-center sticky right-0 bg-background min-w-[100px]">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </AnimatePresence>
                    {isAddingRow ? (
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell key={column.id} className="min-w-[200px]">
                            <Input
                              placeholder={`ערך ל${column.name}`}
                              value={newRowData[column.id] || ""}
                              onChange={(e) =>
                                setNewRowData((prev) => ({
                                  ...prev,
                                  [column.id]: e.target.value,
                                }))
                              }
                              className="text-right"
                              dir="rtl"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="space-x-2 text-center sticky right-0 bg-background min-w-[100px]">
                          <Button onClick={handleAddRow} size="sm" variant="outline">
                            שמור
                          </Button>
                          <Button
                            onClick={() => {
                              setIsAddingRow(false);
                              setNewRowData({});
                            }}
                            size="sm"
                            variant="ghost"
                          >
                            ביטול
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : (
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
                  </TableBody>
                </Table>
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
