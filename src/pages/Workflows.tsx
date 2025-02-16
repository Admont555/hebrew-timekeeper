
import { useState, useCallback } from "react";
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
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionMode,
  Connection,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface WorkflowNodeData {
  label: string;
  onClick?: () => void;
}

interface Workflow {
  id: string;
  name: string;
  position: { x: number; y: number };
  created_at: string;
}

interface WorkflowConnection {
  id: string;
  source_workflow_id: string;
  target_workflow_id: string;
}

interface DatabaseWorkflow {
  id: string;
  name: string;
  position: { x: number; y: number } | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const WorkflowNode = ({ data }: { data: WorkflowNodeData }) => (
  <Card 
    className="p-4 min-w-[150px] hover:shadow-md transition-shadow cursor-pointer text-center"
    onClick={() => data.onClick?.()}
  >
    <div className="flex items-center justify-center gap-2">
      <Workflow className="h-4 w-4 text-purple-500" />
      <span className="font-medium">{data.label}</span>
    </div>
  </Card>
);

const nodeTypes = {
  workflow: WorkflowNode,
};

function WorkflowsContent() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { data: workflows, refetch } = useQuery({
    queryKey: ["workflows"],
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error("No session");
      }

      const { data: workflowsData, error: workflowsError } = await supabase
        .from("workflows")
        .select("*")
        .order("created_at", { ascending: false });

      if (workflowsError) throw workflowsError;

      const { data: connectionsData, error: connectionsError } = await supabase
        .from("workflow_connections")
        .select("*");

      if (connectionsError) throw connectionsError;

      // Convert database workflows to our Workflow type with proper position handling
      const typedWorkflows = (workflowsData as DatabaseWorkflow[]).map(workflow => ({
        ...workflow,
        position: workflow.position || { x: 0, y: 0 }
      })) as Workflow[];

      // Convert workflows to nodes
      const nodes: Node[] = typedWorkflows.map((workflow) => ({
        id: workflow.id,
        type: 'workflow',
        position: workflow.position,
        data: { 
          label: workflow.name,
          onClick: () => navigate(`/workflow-creator/${workflow.id}`)
        },
      }));

      // Convert connections to edges
      const edges: Edge[] = (connectionsData as WorkflowConnection[]).map((conn) => ({
        id: conn.id,
        source: conn.source_workflow_id,
        target: conn.target_workflow_id,
        type: 'smoothstep',
        animated: true,
      }));

      setNodes(nodes);
      setEdges(edges);

      return { workflows: typedWorkflows, connections: connectionsData };
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

    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      toast({
        title: "שגיאה",
        description: "נא להתחבר למערכת",
        variant: "destructive",
      });
      return;
    }

    const position = {
      x: Math.random() * 500,
      y: Math.random() * 300
    };

    const { data: workflow, error } = await supabase
      .from("workflows")
      .insert([{ 
        name: newWorkflowName,
        position,
        user_id: session.data.session.user.id
      }])
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
    
    // Navigate to the workflow creator after creation
    if (workflow) {
      navigate(`/workflow-creator/${workflow.id}`);
    }

    toast({
      title: "זרימת עבודה נוצרה",
      description: "זרימת העבודה נוצרה בהצלחה",
    });
  };

  const onConnect = useCallback(async (params: Connection) => {
    if (params.source && params.target) {
      const { error } = await supabase
        .from("workflow_connections")
        .insert([{
          source_workflow_id: params.source,
          target_workflow_id: params.target,
        }]);

      if (error) {
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה ביצירת הקשר",
          variant: "destructive",
        });
        return;
      }

      setEdges((eds) => addEdge(params, eds));
      
      toast({
        title: "קשר נוצר",
        description: "הקשר בין זרימות העבודה נוצר בהצלחה",
      });
    }
  }, [setEdges]);

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

        <Card className="h-[600px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#94a3b8' }
            }}
          >
            <Background />
            <Controls position="bottom-right" />
          </ReactFlow>
        </Card>
      </motion.div>
    </div>
  );
}

export default function Workflows() {
  return (
    <ReactFlowProvider>
      <WorkflowsContent />
    </ReactFlowProvider>
  );
}
