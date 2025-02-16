
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Workflow } from "lucide-react";
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
  useReactFlow,
} from 'reactflow';
import WorkflowTaskNode from "@/components/WorkflowTaskNode";
import 'reactflow/dist/style.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const { project } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    duration: 30,
    priority: 'normal'
  });

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const handleAddTask = () => {
    if (!newTask.title) {
      toast({
        title: "שגיאה",
        description: "נא להזין כותרת למשימה",
        variant: "destructive",
      });
      return;
    }

    const position = project?.getBoundingClientRect();
    const newNodeId = crypto.randomUUID();
    
    const newNode: Node = {
      id: newNodeId,
      type: 'task',
      position: {
        x: (position?.width || 500) / 2,
        y: (nodes.length * 100) + 100
      },
      data: {
        label: newTask.title,
        duration: newTask.duration,
        priority: newTask.priority,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNewTask({ title: '', duration: 30, priority: 'normal' });
    setIsOpen(false);
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

        <Card className="relative flex-1">
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
            
            <Panel position="top-right" className="flex gap-2">
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    הוסף משימה
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>הוספת משימה חדשה</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">כותרת</Label>
                      <Input
                        id="title"
                        value={newTask.title}
                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="הזן כותרת למשימה..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">משך זמן (בדקות)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newTask.duration}
                        onChange={(e) => setNewTask(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">עדיפות</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="בחר עדיפות" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">גבוהה</SelectItem>
                          <SelectItem value="normal">רגילה</SelectItem>
                          <SelectItem value="low">נמוכה</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddTask} className="w-full">
                      הוסף משימה
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </Panel>
          </ReactFlow>
        </Card>
      </motion.div>
    </div>
  );
}
