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

export default function Tables() {
  const [newTableName, setNewTableName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
        title: "Table created",
        description: "New table has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create table.",
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
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Tables</h1>
        <form onSubmit={handleCreateTable} className="flex gap-4">
          <Input
            placeholder="Enter table name"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            className="w-64"
          />
          <Button type="submit" disabled={!newTableName.trim()}>
            <Plus className="mr-2 h-4 w-4" /> Add Table
          </Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {tables.map((table) => (
            <TableCard key={table.id} table={table} onDelete={handleDelete} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}