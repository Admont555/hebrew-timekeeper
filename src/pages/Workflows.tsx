import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { WorkflowCard } from "@/components/workflow/WorkflowCard";
import { useNavigate } from "react-router-dom";
import { NavMenu } from "@/components/NavMenu";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "שגיאה",
          description: "יש להתחבר למערכת",
          variant: "destructive",
        });
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq('user_id', user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Workflow[];
    },
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("workflows")
        .insert([{ name, user_id: user.id }])
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
    onError: (error) => {
      if (error instanceof Error && error.message === "User not authenticated") {
        toast({
          title: "שגיאה",
          description: "יש להתחבר למערכת",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        toast({
          title: "שגיאה",
          description: "לא הצלחנו ליצור את זרימת העבודה",
          variant: "destructive",
        });
      }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50/80 via-white to-purple-50/80 dark:from-gray-900 dark:via-gray-800/90 dark:to-gray-900 bg-fixed">
      <NavMenu />
      <div className={`container mx-auto px-4 py-8 md:py-12 ${isMobile ? 'pt-16' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`flex flex-col items-center mb-8 space-y-4 ${isMobile ? 'mt-6' : ''}`}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">זרימות עבודה</h1>
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
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {workflows.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
