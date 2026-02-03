"use client";
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  ReactFlowInstance,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Toaster, toast } from 'sonner';
import { ArrowLeft, Save, Play, Layers } from 'lucide-react';
import Link from 'next/link';
import { Analytics } from "@vercel/analytics/next"

// Imports
import { PriceNode, RSINode, ActionNode } from '@/components/nodes'; 
import SMANode from '@/components/nodes/SMANode';
import { SaveDialog } from '@/components/SaveDialog';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

// Node Types
const nodeTypes = {
  priceNode: PriceNode,
  rsiNode: RSINode,
  actionNode: ActionNode,
  smaNode: SMANode,
};

// --- TYPES ---
export type DragPayload = {
  type: string;
  data: any;
};

// --- MAIN COMPONENT ---
export default function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const hasLoaded = useRef(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // Strategy State
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [strategyId, setStrategyId] = useState<string | null>(null);
  const [strategyName, setStrategyName] = useState<string>("Untitled Strategy");

  // Load Strategy if ID is in URL
  useEffect(() => {
    // Prevent double-firing in React Strict Mode
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const isNew = params.get('new');

    if (id) {
      setStrategyId(id);
      loadStrategy(id);
    } else if (isNew) {
      setStrategyId(null);
      setNodes([]);
      setEdges([]);
      setStrategyName("New Strategy");
    }
  }, []); // Removed dependencies to keep it strictly "Run Once on Mount"

  // Load Function
  const loadStrategy = async (id: string) => {
    const { data, error } = await supabase.from('strategies').select('*').eq('id', id).single();
    if (error) {
      toast.error('Failed to load strategy');
      return;
    }
    if (data && data.content) {
      setStrategyName(data.name);
      setNodes(data.content.nodes || []);
      setEdges(data.content.edges || []);
      toast.success(`Loaded "${data.name}"`);
    }
  };

  // Connect & Drag Logic
  const onConnect = useCallback((params: Connection | Edge) => {
    setEdges((eds) => addEdge({ 
      ...params, 
      animated: true, 
      style: { stroke: '#22c55e', strokeWidth: 2 } // Green wires
    }, eds));
  }, [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const raw = event.dataTransfer.getData('application/reactflow');
      if (!raw) return;

      const payload: DragPayload = JSON.parse(raw);
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode = {
        id: `node-${Date.now()}`,
        type: payload.type,
        position,
        data: { 
          ...payload.data,
          // Generic onChange handler for all inputs
          onChange: (newData: any) => {
            setNodes((nds) => nds.map((n) => (n.id === `node-${Date.now()}` ? { ...n, data: newData } : n)));
          } 
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <div className="h-screen w-screen bg-neutral-950 text-white overflow-hidden flex flex-col">
      <Toaster position="top-right" theme="dark" />
      
      {/* 1. THE HUD HEADER */}
      <header className="h-16 border-b border-white/5 bg-neutral-950/80 backdrop-blur-md flex items-center justify-between px-6 z-30 relative shadow-2xl">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> 
            <span className="text-sm font-medium">Exit</span>
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] text-green-500 font-mono uppercase tracking-wider">Active Workspace</span>
            <span className="font-bold text-sm text-white">{strategyName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
            onClick={() => setIsSaveOpen(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-black px-4 py-2 rounded text-sm font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
          >
            <Save className="w-4 h-4" />
            Save Strategy
          </button>
        </div>
      </header>

      {/* 2. THE MAIN WORKSPACE */}
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <div ref={reactFlowWrapper} className="h-full w-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              className="bg-neutral-950"
            >
              {/* Technical Background */}
              <Background 
                color="#222" 
                gap={25} 
                size={1} 
                className="opacity-50"
              />
              
              {/* Styled Controls */}
              <Controls className="bg-neutral-900 border border-white/10 fill-white text-white [&>button]:border-white/10 [&>button:hover]:bg-neutral-800" />
              
              {/* MiniMap for large strategies */}
              <MiniMap 
                style={{ height: 120, width: 160 }} 
                zoomable 
                pannable 
                nodeColor={() => '#22c55e'}
                maskColor="rgba(0,0,0, 0.7)"
                className="!bg-neutral-900 !border !border-white/10 !rounded-lg"
              />
            </ReactFlow>
          </div>
          
          {/* Floating Sidebar (Palette) */}
          <Sidebar />

        </ReactFlowProvider>
      </div>

      {/* Save Dialog Popup */}
      <SaveDialog 
        open={isSaveOpen} 
        onOpenChange={setIsSaveOpen}
        nodes={nodes}
        edges={edges}
        strategyId={strategyId}
        currentName={strategyName}
        onSave={(name) => setStrategyName(name)}
      />
    </div>
  );
}
