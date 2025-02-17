
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { WorkflowCard } from "@/components/workflow/WorkflowCard";

interface Workflow {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
}

export default function Workflows() {
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Workflow[];
    },
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("workflows")
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      setNewWorkflowName("");
      toast({
        title: "זרימת העבודה נוצרה",
        description: "זרימת העבודה החדשה נוצרה בהצלחה",
      });
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו ליצור את זרימת העבודה",
        variant: "destructive",
      });
    },
  });

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflowName.trim()) return;
    createWorkflowMutation.mutate(newWorkflowName);
  };

  const handleDelete = (id: string) => {
    queryClient.setQueryData(["workflows"], (old: Workflow[] | undefined) =>
      old ? old.filter((workflow) => workflow.id !== id) : []
    );
  };

  if (isLoading) {
    return <div>טוען...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center mb-8 space-y-4">
        <h1 className="text-4xl font-bold">זרימות עבודה</h1>
        <form onSubmit={handleCreateWorkflow} className="flex gap-4 w-full max-w-md">
          <Input
            placeholder="הכנס שם זרימת עבודה"
            value={newWorkflowName}
            onChange={(e) => setNewWorkflowName(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!newWorkflowName.trim()}>
            <Plus className="mr-2 h-4 w-4" /> הוסף זרימת עבודה
          </Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {workflows.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} onDelete={handleDelete} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
