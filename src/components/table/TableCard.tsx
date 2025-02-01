import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableCardProps } from "@/types/table";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function TableCard({ table, onDelete }: TableCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(table.name);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("tables")
        .delete()
        .eq("id", table.id);
      if (error) throw error;
    },
    onSuccess: () => {
      onDelete(table.id);
      toast({
        title: "הטבלה נמחקה",
        description: "הטבלה נמחקה בהצלחה",
      });
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו למחוק את הטבלה",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (newName: string) => {
      const { error } = await supabase
        .from("tables")
        .update({ name: newName })
        .eq("id", table.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setIsEditing(false);
      toast({
        title: "הטבלה עודכנה",
        description: "שם הטבלה עודכן בהצלחה",
      });
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לעדכן את שם הטבלה",
        variant: "destructive",
      });
    },
  });

  const handleUpdate = () => {
    if (name.trim() && name !== table.name) {
      updateMutation.mutate(name);
    } else {
      setIsEditing(false);
      setName(table.name);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="hover-scale"
    >
      <Card className="p-6 space-y-4 cursor-pointer" onClick={() => !isEditing && navigate(`/tables/${table.id}`)}>
        <div className="flex items-center justify-between">
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleUpdate}
              onKeyPress={(e) => e.key === "Enter" && handleUpdate()}
              className="border p-1 rounded"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <h3 className="text-lg font-semibold">{table.name}</h3>
          )}
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteMutation.mutate()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}