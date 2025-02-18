
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Background,
  Connection,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Workflow } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NodeData {
  label: string;
  duration?: number;
  priority?: string;
  [key: string]: any;
}

const initialNodes: Node<NodeData>[] = [
  {
    id: 'start',
    type: 'input',
    data: { 
      label: 'התחלה',
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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-lg text-gray-600">טוען...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      dir="rtl"
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

      <div className="h-[700px] rounded-xl border bg-gray-50/50 overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
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
    </motion.div>
  );
}

export default WorkflowCreator;
