import { useState, useEffect, useCallback } from "react";
import type { XYPosition } from '@xyflow/react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Connection, Edge, Node } from '@xyflow/react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Save, Workflow } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WorkflowStep {
  id: string;
  workflow_id: string;
  title: string;
  position: XYPosition;
  duration: number;
  priority: string;
}

interface CustomNode extends Node {
  style?: {
    background: string;
    color?: string;
    border: string;
    borderRadius?: string;
    width: number;
    padding?: string;
  };
}

const initialNodes: CustomNode[] = [
  {
    id: 'start',
    type: 'input',
    data: { label: 'התחלה' },
    position: { x: 250, y: 0 },
    style: {
      background: '#4CAF50',
      color: 'white',
      border: 'none',
      width: 150,
    },
  },
];

export default function WorkflowCreator() {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workflowName, setWorkflowName] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadWorkflow = async () => {
      if (!workflowId) return;

      const { data: workflow, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error) {
        toast({
          title: "שגיאה",
          description: "לא הצלחנו לטעון את זרימת העבודה",
          variant: "destructive",
        });
        return;
      }

      if (workflow) {
        setWorkflowName(workflow.name);
        const { data: steps, error: stepsError } = await supabase
          .from('workflow_tasks')
          .select('*')
          .eq('workflow_id', workflowId);

        if (!stepsError && steps) {
          const workflowNodes: CustomNode[] = steps.map((step) => ({
            id: step.id,
            type: 'default',
            data: { label: step.title },
            position: typeof step.position === 'string' 
              ? JSON.parse(step.position)
              : step.position || { x: 0, y: 0 },
            style: {
              background: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '8px',
              width: 180,
              padding: '10px',
            },
          }));
          setNodes([...initialNodes, ...workflowNodes]);
        }
      }
    };

    loadWorkflow();
  }, [workflowId, setNodes, toast]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddStep = () => {
    const newId = crypto.randomUUID();
    const yOffset = nodes.length * 100;
    
    const newNode: CustomNode = {
      id: newId,
      type: 'default',
      data: { label: 'שלב חדש' },
      position: { x: 250, y: yOffset },
      style: {
        background: '#f0f0f0',
        border: '1px solid #ddd',
        borderRadius: '8px',
        width: 180,
        padding: '10px',
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSaveWorkflow = async () => {
    if (!workflowName.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין שם לזרימת העבודה",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      let workflowToUse = workflowId;

      if (!workflowId) {
        const { data: workflow, error: workflowError } = await supabase
          .from('workflows')
          .insert([
            { name: workflowName, user_id: user.id }
          ])
          .select()
          .single();

        if (workflowError) throw workflowError;
        workflowToUse = workflow.id;
      } else {
        const { error: updateError } = await supabase
          .from('workflows')
          .update({ name: workflowName })
          .eq('id', workflowId);

        if (updateError) throw updateError;
      }

      const stepsToSave = nodes
        .filter(node => node.id !== 'start')
        .map(node => ({
          id: node.id,
          workflow_id: workflowToUse,
          title: node.data.label as string,
          position: node.position,
          duration: 0,
          priority: 'medium',
        }));

      if (stepsToSave.length > 0) {
        const { error: stepsError } = await supabase
          .from('workflow_tasks')
          .upsert(stepsToSave, {
            onConflict: 'id'
          });

        if (stepsError) throw stepsError;
      }

      toast({
        title: "זרימת העבודה נשמרה",
        description: "זרימת העבודה נשמרה בהצלחה",
      });
      
      navigate('/workflows');
    } catch (error) {
      console.error('Error saving workflow:', error);
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
          description: "אירעה שגיאה בשמירת זרימת העבודה",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            חזור
          </Button>
          <div className="flex items-center gap-2">
            <Workflow className="h-6 w-6 text-purple-500" />
            <h1 className="text-2xl font-bold">יצירת זרימת עבודה</h1>
          </div>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="workflowName">שם זרימת העבודה</Label>
              <Input
                id="workflowName"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="הזן שם לזרימת העבודה..."
                className="max-w-md"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">שלבים</h2>
                <Button
                  onClick={handleAddStep}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  הוסף שלב
                </Button>
              </div>

              <div style={{ height: 500 }} className="rounded-lg border">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                >
                  <Background />
                  <Controls />
                  <MiniMap />
                </ReactFlow>
              </div>
            </div>

            <Button
              onClick={handleSaveWorkflow}
              className="w-full sm:w-auto gap-2"
              size="lg"
              disabled={isSaving}
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'שומר...' : 'שמור זרימת עבודה'}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
