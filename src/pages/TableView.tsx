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
    <div className="container mx-auto p-6 bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#403E43] mb-2">
            {table?.name}
          </h1>
          <p className="text-[#8E9196]">נהל את הטבלה שלך</p>
        </div>

        {/* Add Column Form */}
        <form onSubmit={handleAddColumn} className="flex justify-center gap-4 mb-8">
          <Input
            placeholder="שם העמודה החדשה"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" disabled={!newColumnName.trim()}>
            <Plus className="mr-2 h-4 w-4" /> הוסף עמודה
          </Button>
        </form>

        {/* Table */}
        <ScrollArea className="h-[500px] rounded-md border border-[#8E9196]/20">
          <div className="p-4">
            {columns.length > 0 ? (
              <div className="space-y-4">
                {/* Column Headers */}
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns.length + 1}, minmax(150px, 1fr))` }}>
                  {columns.map((column) => (
                    <div
                      key={column.id}
                      className="flex items-center justify-between bg-[#0EA5E9] text-white p-2 rounded"
                    >
                      <span>{column.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteColumnMutation.mutate(column.id)}
                        className="hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="bg-[#0EA5E9] text-white p-2 rounded text-center">
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
                      className="grid gap-4"
                      style={{ gridTemplateColumns: `repeat(${columns.length + 1}, minmax(150px, 1fr))` }}
                    >
                      {columns.map((column) => (
                        <div
                          key={column.id}
                          className="bg-white p-2 rounded shadow-sm"
                        >
                          {row.data[column.id] || "-"}
                        </div>
                      ))}
                      <div className="flex justify-center items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Add Row Form */}
                <form onSubmit={handleAddRow}>
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
                      />
                    ))}
                    <Button type="submit">
                      <Plus className="mr-2 h-4 w-4" /> הוסף שורה
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center text-[#8E9196] py-8">
                אין עמודות עדיין. הוסף עמודה חדשה כדי להתחיל.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}