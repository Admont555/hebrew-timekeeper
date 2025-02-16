
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Workflow } from "lucide-react";
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
} from 'reactflow';
import WorkflowTaskNode from "@/components/WorkflowTaskNode";
import 'reactflow/dist/style.css';

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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

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
          </ReactFlow>
        </Card>
      </motion.div>
    </div>
  );
}
