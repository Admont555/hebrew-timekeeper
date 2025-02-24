
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Workflow } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WorkflowCardProps {
  workflow: {
    id: string;
    name: string;
  };
  onDelete: (id: string) => void;
}

export function WorkflowCard({ workflow, onDelete }: WorkflowCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workflow.name);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("workflows")
        .delete()
        .eq("id", workflow.id);
      if (error) throw error;
    },
    onSuccess: () => {
      onDelete(workflow.id);
      toast({
        title: "זרימת העבודה נמחקה",
        description: "זרימת העבודה נמחקה בהצלחה",
      });
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו למחוק את זרימת העבודה",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (newName: string) => {
      const { error } = await supabase
        .from("workflows")
        .update({ name: newName })
        .eq("id", workflow.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      setIsEditing(false);
      toast({
        title: "זרימת העבודה עודכנה",
        description: "שם זרימת העבודה עודכן בהצלחה",
      });
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לעדכן את שם זרימת העבודה",
        variant: "destructive",
      });
    },
  });

  const handleUpdate = () => {
    if (name.trim() && name !== workflow.name) {
      updateMutation.mutate(name);
    } else {
      setIsEditing(false);
      setName(workflow.name);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setName(workflow.name);
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
      <Card 
        className="p-6 space-y-4 cursor-pointer" 
        onClick={() => !isEditing && navigate(`/workflows/${workflow.id}`)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-purple-500" />
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleUpdate}
                onKeyDown={handleKeyPress}
                className="border p-1 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <h3 className="text-lg font-semibold">{workflow.name}</h3>
            )}
          </div>
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
