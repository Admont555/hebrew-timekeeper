
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Workflow } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function Workflows() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");

  const { data: workflows, refetch } = useQuery({
    queryKey: ["workflows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין שם לזרימת העבודה",
        variant: "destructive",
      });
      return;
    }

    const { data: workflow, error } = await supabase
      .from("workflows")
      .insert([{ name: newWorkflowName }])
      .select()
      .single();

    if (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת זרימת העבודה",
        variant: "destructive",
      });
      return;
    }

    setIsOpen(false);
    setNewWorkflowName("");
    refetch();
    navigate(`/workflow-creator/${workflow.id}`);
  };

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="h-6 w-6 text-purple-500" />
            <h1 className="text-2xl font-bold">זרימות עבודה</h1>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                צור זרימת עבודה
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>יצירת זרימת עבודה חדשה</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">שם זרימת העבודה</Label>
                  <Input
                    id="name"
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                    placeholder="הזן שם..."
                  />
                </div>
                <Button onClick={handleCreateWorkflow} className="w-full">
                  צור
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows?.map((workflow) => (
            <Card
              key={workflow.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/workflow-creator/${workflow.id}`)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{workflow.name}</h3>
                <Workflow className="h-4 w-4 text-purple-500" />
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
