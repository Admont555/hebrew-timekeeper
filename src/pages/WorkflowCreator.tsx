import { useState, useEffect, useCallback } from "react";
import {
  Background,
  Connection,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  Position,
  ReactFlow,
  XYPosition,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Save, Workflow, Delete } from "lucide-react";
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
      padding: '12px',
      borderRadius: '8px',
    },
  },
];

function WorkflowCreator() {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workflowName, setWorkflowName] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWorkflow = async () => {
      if (!workflowId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: workflow, error } = await supabase
          .from('workflows')
          .select('*')
          .eq('id', workflowId)
          .single();

        if (error) throw error;

        if (workflow) {
          setWorkflowName(workflow.name);
          const { data: steps, error: stepsError } = await supabase
            .from('workflow_tasks')
            .select('*')
            .eq('workflow_id', workflowId);

          if (stepsError) throw stepsError;

          if (steps) {
            const workflowNodes: CustomNode[] = steps.map((step) => ({
              id: step.id,
              type: 'default',
              data: { 
                label: step.title,
                duration: step.duration,
                priority: step.priority,
              },
              position: typeof step.position === 'string' 
                ? JSON.parse(step.position)
                : step.position || { x: 0, y: 0 },
              style: {
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                width: 200,
                padding: '16px',
              },
            }));
            setNodes([...initialNodes, ...workflowNodes]);
          }
        }
      } catch (error) {
        console.error('Error loading workflow:', error);
        toast({
          title: "שגיאה",
          description: "לא הצלחנו לטעון את זרימת העבודה",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkflow();
  }, [workflowId, setNodes, toast]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(
      { 
        ...params, 
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6b7280', strokeWidth: 2 },
      }, 
      eds
    )),
    [setEdges]
  );

  const handleAddStep = () => {
    const newId = crypto.randomUUID();
    const yOffset = nodes.length * 120;
    
    const newNode: CustomNode = {
      id: newId,
      type: 'default',
      data: { 
        label: 'שלב חדש',
        duration: 0,
        priority: 'normal',
      },
      position: { x: 250, y: yOffset },
      style: {
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        width: 200,
        padding: '16px',
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
  };

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

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
          priority: 'normal',
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-lg text-gray-600">טוען...</div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold">
              {workflowId ? 'עריכת זרימת עבודה' : 'יצירת זרימת עבודה'}
            </h1>
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
                  variant="secondary"
                >
                  <Plus className="h-4 w-4" />
                  הוסף שלב
                </Button>
              </div>

              <div style={{ height: 600 }} className="rounded-lg border bg-gray-50/50">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                  className="bg-dot-pattern"
                  defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: true,
                  }}
                >
                  <Background color="#94a3b8" gap={16} size={1} />
                  <Controls className="bg-white border rounded-lg shadow-sm" />
                  <MiniMap className="bg-white border rounded-lg shadow-sm" />
                </ReactFlow>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                ביטול
              </Button>
              <Button
                onClick={handleSaveWorkflow}
                className="gap-2"
                size="lg"
                disabled={isSaving}
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'שומר...' : 'שמור זרימת עבודה'}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default WorkflowCreator;
