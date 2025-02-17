import { useState, useEffect, useCallback, useRef } from "react";
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
  Panel,
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
import { ArrowLeft, Plus, Save, Workflow, Download, Edit, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
    boxShadow?: string;
  };
}

const CustomNodeComponent = ({ data, id }: { data: any; id: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    data.onNodeLabelChange(id, title);
    setIsEditing(false);
  };

  return (
    <div className="group relative min-w-[200px] bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-lg border border-gray-100">
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-lg shadow-sm"
          onClick={() => setIsEditing(true)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        {id !== 'start' && (
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8 rounded-lg shadow-sm"
            onClick={() => data.onNodeDelete(id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="min-w-[180px]">
          <Input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm"
            onBlur={handleSubmit}
          />
        </form>
      ) : (
        <div className="space-y-2">
          <div className="text-sm font-medium">{data.label}</div>
          {data.duration > 0 && (
            <div className="text-xs text-gray-500">
              משך: {data.duration} דקות
            </div>
          )}
          {data.priority && (
            <div className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
              {data.priority === 'high' ? '🔴 עדיפות גבוהה' : 
               data.priority === 'low' ? '🟢 עדיפות נמוכה' : 
               '🟡 עדיפות רגילה'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const initialNodes: CustomNode[] = [
  {
    id: 'start',
    type: 'input',
    data: { label: 'התחלה' },
    position: { x: 250, y: 50 },
    style: {
      background: 'linear-gradient(45deg, #6366f1, #4f46e5)',
      color: 'white',
      border: 'none',
      width: 200,
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgb(99 102 241 / 0.2), 0 2px 4px -2px rgb(99 102 241 / 0.2)',
    },
  },
];

function WorkflowCreator() {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [workflowName, setWorkflowName] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleNodeLabelChange = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: newLabel,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const nodeTypes = {
    default: (props: any) => (
      <CustomNodeComponent 
        {...props} 
        data={{ 
          ...props.data, 
          onNodeLabelChange: handleNodeLabelChange,
          onNodeDelete: handleDeleteNode,
        }} 
      />
    ),
  };

  const handleDownloadPDF = useCallback(async () => {
    if (reactFlowWrapper.current) {
      try {
        const canvas = await html2canvas(reactFlowWrapper.current, {
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`workflow-${workflowName || 'untitled'}.pdf`);

        toast({
          title: "הצלחה",
          description: "זרימת העבודה נשמרה כ-PDF בהצלחה",
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה ביצירת ה-PDF",
          variant: "destructive",
        });
      }
    }
  }, [workflowName, toast]);

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
        markerEnd: { type: MarkerType.ArrowClosed },
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
            <Workflow className="h-6 w-6 text-indigo-500" />
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

            <div 
              ref={reactFlowWrapper}
              className="relative h-[700px] rounded-xl border bg-gray-50/50 overflow-hidden"
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-dot-pattern"
                defaultEdgeOptions={{
                  type: 'smoothstep',
                  animated: true,
                  style: { 
                    strokeWidth: 2,
                    stroke: '#6366f1',
                  },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#6366f1',
                  },
                }}
              >
                <Background 
                  color="#6366f1" 
                  gap={16} 
                  size={1} 
                  className="opacity-5"
                />
                <Controls 
                  className="bg-white border rounded-xl shadow-lg p-2"
                  style={{ right: 16, left: 'auto' }}
                />
                <MiniMap 
                  className="bg-white border rounded-xl shadow-lg"
                  style={{ right: 16, left: 'auto', bottom: 16 }}
                  nodeColor="#e0e7ff"
                  maskColor="rgb(99 102 241 / 0.1)"
                />
                <Panel 
                  position="top-center" 
                  className="bg-white rounded-xl shadow-lg p-2 flex gap-2"
                  style={{ top: -50 }}
                >
                  <Button
                    onClick={handleAddStep}
                    className="gap-2"
                    variant="secondary"
                  >
                    <Plus className="h-4 w-4" />
                    הוסף שלב
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    הורד כ-PDF
                  </Button>
                </Panel>
              </ReactFlow>
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
