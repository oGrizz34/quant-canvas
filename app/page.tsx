'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactFlow, {
  Node,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowProvider,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Toaster, toast } from 'sonner';

import { PriceNode, RSINode, ActionNode } from '@/components/nodes';
import { supabase } from '@/lib/supabase';

const nodeTypes: NodeTypes = {
  priceNode: PriceNode,
  rsiNode: RSINode,
  actionNode: ActionNode,
};

type DragPayload =
  | { type: 'priceNode'; data: { ticker: string } }
  | { type: 'rsiNode'; data: { period: number } }
  | { type: 'actionNode'; data: { actionType: 'Buy' | 'Sell' } };

const SIDEBAR_ITEMS: { id: string; label: string; sub: string; payload: DragPayload }[] = [
  { id: 'price', label: 'Price', sub: 'Data', payload: { type: 'priceNode', data: { ticker: 'SPY' } } },
  { id: 'rsi', label: 'RSI', sub: 'Indicator', payload: { type: 'rsiNode', data: { period: 14 } } },
  { id: 'buy', label: 'Buy Action', sub: 'Action', payload: { type: 'actionNode', data: { actionType: 'Buy' } } },
  { id: 'sell', label: 'Sell Action', sub: 'Action', payload: { type: 'actionNode', data: { actionType: 'Sell' } } },
];

function Sidebar() {
  const onDragStart = (e: React.DragEvent, payload: DragPayload) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="absolute left-4 top-4 z-10 min-w-[180px] rounded-lg border border-[#333] bg-[#1a1a1a] p-4 shadow-xl">
      <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#39ff14]">
        Components
      </div>
      <div className="space-y-2">
        {SIDEBAR_ITEMS.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => onDragStart(e, item.payload)}
            className="cursor-grab rounded border border-[#333] bg-[#222] px-3 py-2 transition-colors hover:border-[#39ff14]/50 hover:bg-[#2a2a2a] active:cursor-grabbing"
          >
            <div className="text-sm font-medium text-white">{item.label}</div>
            <div className="font-mono text-xs text-[#666]">{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Flow() {
  const router = useRouter();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const raw = e.dataTransfer.getData('application/reactflow');
      if (!raw) return;

      const payload = JSON.parse(raw) as DragPayload;
      const position = reactFlowInstance.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      const newNode: Node = {
        id: `${payload.type}-${Date.now()}`,
        type: payload.type,
        position,
        data: payload.data,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onSaveStrategy = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/login');
      return;
    }

    const strategy = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? null,
        targetHandle: e.targetHandle ?? null,
      })),
    };

    try {
      const { error } = await supabase
        .from('strategies')
        .insert({
          name: 'My First Strategy',
          content: strategy,
          user_id: user.id,
        });

      if (error) {
        toast.error('Failed to save');
      } else {
        toast.success('Strategy saved to cloud');
      }
    } catch (err) {
      toast.error('Failed to save');
    }
  }, [nodes, edges, router]);

  return (
    <div className="relative h-screen w-full bg-[#111]">
      <Toaster position="top-center" theme="dark" toastOptions={{ classNames: { success: '!border-[#39ff14]', error: '!border-red-500' } }} />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #39ff14 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
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
            className="bg-transparent"
          >
            <Background color="#333" gap={20} size={1} />
            <Controls className="rounded-lg border border-[#333] bg-[#1a1a1a] [&>button]:border-[#333] [&>button]:bg-[#222] [&>button]:text-white hover:[&>button]:border-[#39ff14]/50 hover:[&>button]:bg-[#2a2a2a]" />
            <MiniMap
              className="rounded-lg border border-[#333] bg-[#1a1a1a]"
              nodeColor="#39ff14"
              maskColor="rgba(0, 0, 0, 0.6)"
            />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
      <Sidebar />
      <button
        type="button"
        onClick={onSaveStrategy}
        className="absolute right-4 top-4 z-10 rounded-lg border border-[#39ff14] bg-[#1a1a1a] px-4 py-2 font-mono text-sm font-semibold text-[#39ff14] shadow-lg shadow-[#39ff14]/10 transition-colors hover:bg-[#39ff14]/10 hover:shadow-[#39ff14]/20"
      >
        Save Strategy
      </button>
    </div>
  );
}

function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
        return;
      }
      setChecked(true);
    });
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#111]">
        <div className="font-mono text-[#39ff14]">Loading…</div>
      </div>
    );
  }

  return <Flow />;
}

export default Home;
