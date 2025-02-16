
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TaskForm from "@/components/TaskForm";
import { Task, TaskPriority } from "@/types/task";
import { ArrowLeft, Plus, Save, Workflow } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ReactFlow,
  Background,
  Controls,
  Edge,
  Node,
  addEdge,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
} from '@xyflow/react';
import WorkflowTaskNode from "@/components/WorkflowTaskNode";
import '@xyflow/react/dist/style.css';

const nodeTypes = {
  task: WorkflowTaskNode,
};

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'input',
    data: { label: 'התחלה' },
    position: { x: 250, y: 0 },
    className: 'bg-card p-2 rounded-lg border shadow-sm text-sm font-medium'
  }
];

export default function WorkflowCreator() {
  const navigate = useNavigate();
  const [workflowName, setWorkflowName] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const handleAddTask = (title: string, duration: number, priority: TaskPriority) => {
    const newNode: Node = {
      id: crypto.randomUUID(),
      type: 'task',
      data: { 
        label: title,
        duration,
        priority 
      },
      position: { 
        x: 250,
        y: (nodes.length * 150)
      },
    };

    setNodes((nds) => [...nds, newNode]);
    
    // Add edge from last node to new node
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      const newEdge: Edge = {
        id: `${lastNode.id}-${newNode.id}`,
        source: lastNode.id,
        target: newNode.id,
        type: 'smoothstep',
      };
      setEdges((eds) => [...eds, newEdge]);
    }

    toast({
      title: "משימה נוספה",
      description: "המשימה נוספה לזרימת העבודה בהצלחה",
    });
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
    if (nodes.length <= 1) {
      toast({
        title: "שגיאה",
        description: "יש להוסיף לפחות משימה אחת לזרימת העבודה",
        variant: "destructive",
      });
      return;
    }

    try {
      // Insert workflow
      const { data: workflow, error: workflowError } = await supabase
        .from('workflows')
        .insert({ name: workflowName })
        .select()
        .single();

      if (workflowError) throw workflowError;

      // Insert workflow tasks
      const tasks = nodes
        .filter(node => node.type === 'task')
        .map((node, index) => ({
          workflow_id: workflow.id,
          title: node.data.label,
          duration: node.data.duration,
          priority: node.data.priority,
          position: index
        }));

      const { error: tasksError } = await supabase
        .from('workflow_tasks')
        .insert(tasks);

      if (tasksError) throw tasksError;

      toast({
        title: "זרימת העבודה נשמרה",
        description: "זרימת העבודה נשמרה בהצלחה",
      });

      navigate('/');
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: "שגיאה בשמירת זרימת העבודה",
        description: "אירעה שגיאה בשמירת זרימת העבודה",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 h-[calc(100vh-4rem)]" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-full flex flex-col gap-6"
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

        <div className="grid grid-cols-1 md:grid-cols-[300px,1fr] gap-6 flex-1">
          <Card className="p-6 space-y-6 h-fit">
            <div className="space-y-2">
              <Label htmlFor="workflowName">שם זרימת העבודה</Label>
              <Input
                id="workflowName"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="הזן שם לזרימת העבודה..."
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">הוספת משימה</h2>
              <TaskForm onAddTask={handleAddTask} />
            </div>

            <Button
              onClick={handleSaveWorkflow}
              className="w-full gap-2"
              size="lg"
            >
              <Save className="h-4 w-4" />
              שמור זרימת עבודה
            </Button>
          </Card>

          <Card className="relative min-h-[500px]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Loose}
              fitView
              className="rounded-lg bg-muted/30"
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#94a3b8' }
              }}
            >
              <Background className="bg-muted/20" />
              <Controls position="bottom-right" />
              <Panel position="top-left" className="bg-background/80 p-2 rounded-lg backdrop-blur">
                <div className="text-sm text-muted-foreground">
                  {nodes.length - 1} משימות
                </div>
              </Panel>
            </ReactFlow>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
