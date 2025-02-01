import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function TableView() {
  const { tableId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newColumnName, setNewColumnName] = useState("");
  const [newRowData, setNewRowData] = useState<Record<string, string>>({});

  // Fetch table details
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
    if (Object.keys(newRowData).length === 0) return;
    addRowMutation.mutate(newRowData);
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-background/50">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-primary mb-2">
            {table?.name}
          </h1>
          <p className="text-muted-foreground">נהל את הטבלה שלך</p>
        </motion.div>

        {/* Add Column Form */}
        <Card className="p-6 shadow-sm">
          <form onSubmit={handleAddColumn} className="flex flex-col items-center gap-4">
            <div className="flex w-full max-w-sm gap-4">
              <Input
                placeholder="שם העמודה החדשה"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!newColumnName.trim()}>
                <Plus className="mr-2 h-4 w-4" /> הוסף עמודה
              </Button>
            </div>
          </form>
        </Card>

        {/* Table Content */}
        <Card className="overflow-hidden">
          <ScrollArea className="h-[500px]">
            <div className="p-4">
              {columns.length > 0 ? (
                <div className="space-y-4">
                  {/* Column Headers */}
                  <div 
                    className="grid gap-4" 
                    style={{ gridTemplateColumns: `repeat(${columns.length + 1}, minmax(150px, 1fr))` }}
                  >
                    {columns.map((column) => (
                      <motion.div
                        key={column.id}
                        layout
                        className="flex items-center justify-between bg-primary/5 p-3 rounded-md transition-colors hover:bg-primary/10"
                      >
                        <span className="font-medium">{column.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteColumnMutation.mutate(column.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                    <div className="bg-primary/5 p-3 rounded-md text-center font-medium">
                      פעולות
                    </div>
                  </div>

                  {/* Rows */}
                  <AnimatePresence>
                    {rows.map((row, index) => (
                      <motion.div
                        key={row.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid gap-4 group"
                        style={{ gridTemplateColumns: `repeat(${columns.length + 1}, minmax(150px, 1fr))` }}
                      >
                        {columns.map((column) => (
                          <div
                            key={column.id}
                            className="bg-card p-3 rounded-md shadow-sm transition-all hover:shadow-md"
                          >
                            {row.data[column.id] || "-"}
                          </div>
                        ))}
                        <div className="flex justify-center items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add Row Form */}
                  <motion.form
                    initial={false}
                    animate={{ height: "auto" }}
                    onSubmit={handleAddRow}
                  >
                    <div
                      className="grid gap-4 mb-4"
                      style={{ gridTemplateColumns: `repeat(${columns.length + 1}, minmax(150px, 1fr))` }}
                    >
                      {columns.map((column) => (
                        <Input
                          key={column.id}
                          placeholder={`ערך ל${column.name}`}
                          value={newRowData[column.id] || ""}
                          onChange={(e) =>
                            setNewRowData((prev) => ({
                              ...prev,
                              [column.id]: e.target.value,
                            }))
                          }
                          className="transition-all hover:ring-1 hover:ring-primary/20"
                        />
                      ))}
                      <Button type="submit" variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> הוסף שורה
                      </Button>
                    </div>
                  </motion.form>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  אין עמודות עדיין. הוסף עמודה חדשה כדי להתחיל.
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}