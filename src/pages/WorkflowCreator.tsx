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
import { ArrowLeft, Plus, Save, Workflow, Download } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type Priority = 'high' | 'normal' | 'low';

interface NodeData {
  label: string;
  duration: number;
  priority: Priority;
  [key: string]: any;
}

interface WorkflowStep {
  id: string;
  workflow_id: string;
  title: string;
  position: XYPosition;
  duration: number;
  priority: Priority;
}

type CustomNode = Node<NodeData>;

const CustomNodeComponent = ({ data }: { data: NodeData }) => {
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="min-w-[280px] bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="space-y-3">
        <div className="text-lg font-medium">{data.label}</div>
        {data.duration > 0 && (
          <div className="text-sm text-gray-500">
            משך: {data.duration} דקות
          </div>
        )}
        {data.priority && (
          <div className={`inline-block px-3 py-1 text-sm rounded-full ${getPriorityColor(data.priority)}`}>
            {data.priority === 'high' ? '🔴 עדיפות גבוהה' : 
             data.priority === 'low' ? '🟢 עדיפות נמוכה' : 
             '🟡 עדיפות רגילה'}
          </div>
        )}
      </div>
    </div>
  );
};

const initialNodes: CustomNode[] = [
  {
    id: 'start',
    type: 'input',
    data: { 
      label: 'התחלה',
      duration: 0,
      priority: 'normal' as Priority
    },
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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [editingStep, setEditingStep] = useState({
    title: '',
    duration: 0,
    priority: 'normal' as Priority
  });

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
                priority: step.priority as Priority,
              },
              position: typeof step.position === 'string' 
                ? JSON.parse(step.position)
                : step.position || { x: 0, y: 0 },
              style: {
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                width: 280,
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
        style: { strokeWidth: 2, stroke: '#6366f1' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
      }, 
      eds
    )),
    [setEdges]
  );

  const handleAddStep = () => {
    const newId = crypto.randomUUID();
    const lastNode = [...nodes].sort((a, b) => b.position.y - a.position.y)[0];
    const yOffset = lastNode ? lastNode.position.y + 200 : 200;
    
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
        width: 280,
        padding: '16px',
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
    setEditingStep({
      title: 'שלב חדש',
      duration: 0,
      priority: 'normal'
    });
  };

  const handleUpdateStep = () => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: editingStep.title,
              duration: editingStep.duration,
              priority: editingStep.priority,
            },
          };
        }
        return node;
      })
    );
  };

  const handleDeleteStep = () => {
    if (!selectedNode) return;
    
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNode(null);
  };

  const handleNodeClick = (event: React.MouseEvent, node: Node<NodeData>) => {
    if (node.id === 'start') return;
    setSelectedNode(node as CustomNode);
    setEditingStep({
      title: node.data.label,
      duration: node.data.duration,
      priority: node.data.priority
    });
  };

  const handleDownloadPDF = async () => {
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
          title: node.data.label,
          position: JSON.stringify(node.position),
          duration: node.data.duration,
          priority: node.data.priority,
        }));

      if (stepsToSave.length > 0) {
        const { error: stepsError } = await supabase
          .from('workflow_tasks')
          .upsert(stepsToSave);

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

  const nodeTypes = {
    default: CustomNodeComponent,
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

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="workflowName">שם זרימת העבודה</Label>
                  <Input
                    id="workflowName"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="הזן שם לזרימת העבודה..."
                  />
                </div>

                <div 
                  ref={reactFlowWrapper}
                  className="h-[700px] rounded-xl border bg-gray-50/50 overflow-hidden"
                >
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={handleNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
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
                    <Background color="#6366f1" gap={16} size={1} className="opacity-5" />
                    <Controls className="bg-white border rounded-xl shadow-lg p-2" />
                    <MiniMap
                      className="bg-white border rounded-xl shadow-lg"
                      nodeColor="#e0e7ff"
                      maskColor="rgb(99 102 241 / 0.1)"
                    />
                  </ReactFlow>
                </div>
              </div>
            </Card>
          </div>

          <div className="col-span-4">
            <Card className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">עריכת שלבים</h2>
                <Button onClick={handleAddStep} className="gap-2">
                  <Plus className="h-4 w-4" />
                  הוסף שלב
                </Button>
              </div>

              {selectedNode && selectedNode.id !== 'start' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>כותרת</Label>
                    <Input
                      value={editingStep.title}
                      onChange={(e) => setEditingStep(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="שם השלב..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>משך (דקות)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editingStep.duration}
                      onChange={(e) => setEditingStep(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>עדיפות</Label>
                    <select
                      value={editingStep.priority}
                      onChange={(e) => setEditingStep(prev => ({ ...prev, priority: e.target.value as 'high' | 'normal' | 'low' }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="high">גבוהה</option>
                      <option value="normal">רגילה</option>
                      <option value="low">נמוכה</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteStep}
                      className="flex-1"
                    >
                      מחק שלב
                    </Button>
                    <Button
                      onClick={handleUpdateStep}
                      className="flex-1"
                    >
                      עדכן שלב
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  בחר שלב כדי לערוך אותו
                </div>
              )}

              <div className="flex flex-col gap-2 pt-4">
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  הורד כ-PDF
                </Button>
                <Button
                  onClick={handleSaveWorkflow}
                  className="w-full gap-2"
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'שומר...' : 'שמור זרימת עבודה'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default WorkflowCreator;
