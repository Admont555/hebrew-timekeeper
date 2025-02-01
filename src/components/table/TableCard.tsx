import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableCardProps } from "@/types/table";
import { Pencil, Trash2, Table as TableIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export function TableCard({ table, onDelete }: TableCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(table.name);
  const { toast } = useToast();

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from("tables")
        .update({ name })
        .eq("id", table.id);

      if (error) throw error;

      toast({
        title: "Table updated",
        description: "The table name has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update table name.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("tables")
        .delete()
        .eq("id", table.id);

      if (error) throw error;

      onDelete(table.id);
      toast({
        title: "Table deleted",
        description: "The table has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete table.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TableIcon className="h-8 w-8 text-primary" />
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border rounded px-2 py-1"
                autoFocus
                onBlur={handleUpdate}
                onKeyPress={(e) => e.key === "Enter" && handleUpdate()}
              />
            ) : (
              <h3 className="text-xl font-semibold">{table.name}</h3>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Created on {new Date(table.created_at || "").toLocaleDateString()}
        </div>
      </Card>
    </motion.div>
  );
}