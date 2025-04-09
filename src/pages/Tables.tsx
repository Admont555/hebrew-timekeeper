import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TableCard } from "@/components/table/TableCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table } from "@/types/table";
import { motion, AnimatePresence } from "framer-motion";
import { NavMenu } from "@/components/NavMenu";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Tables() {
  const [newTableName, setNewTableName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tables")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Table[];
    },
  });

  const createTableMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("tables")
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setNewTableName("");
      toast({
        title: "הטבלה נוצרה",
        description: "הטבלה החדשה נוצרה בהצלחה",
      });
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו ליצור את הטבלה",
        variant: "destructive",
      });
    },
  });

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;
    createTableMutation.mutate(newTableName);
  };

  const handleDelete = (id: string) => {
    queryClient.setQueryData(["tables"], (old: Table[] | undefined) =>
      old ? old.filter((table) => table.id !== id) : []
    );
  };

  if (isLoading) {
    return <div>טוען...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/80 via-white to-purple-50/80 dark:from-gray-900 dark:via-gray-800/90 dark:to-gray-900 bg-fixed">
      <NavMenu />
      <div className={`container mx-auto px-4 py-8 md:py-12 ${isMobile ? 'pt-16' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`flex flex-col items-center mb-8 space-y-4 ${isMobile ? 'mt-6' : ''}`}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">טבלאות</h1>
          <form onSubmit={handleCreateTable} className="flex gap-4 w-full max-w-md">
            <Input
              placeholder="הכנס שם טבלה"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!newTableName.trim()}>
              <Plus className="mr-2 h-4 w-4" /> הוסף טבלה
            </Button>
          </form>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {tables.map((table) => (
              <TableCard key={table.id} table={table} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
