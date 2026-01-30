"use client";
import React from 'react';
import { 
  MousePointer2, 
  Activity, 
  TrendingUp, 
  ShoppingCart, 
  DollarSign,
  Filter
} from 'lucide-react';

// This definition helps TypeScript know what data is being dragged
type DragPayload = {
  type: string;
  data: any;
};

const SIDEBAR_ITEMS = [
  { 
    id: 'price', 
    label: 'Price Node', 
    sub: 'Market Data', 
    icon: DollarSign,
    color: 'text-green-400',
    payload: { type: 'priceNode', data: { ticker: 'SPY' } } 
  },
  { 
    id: 'rsi', 
    label: 'RSI Indicator', 
    sub: 'Momentum', 
    icon: Activity, 
    color: 'text-purple-400',
    payload: { type: 'rsiNode', data: { period: 14 } } 
  },
  { 
    id: 'sma', 
    label: 'SMA Filter', 
    sub: 'Trend Logic', 
    icon: TrendingUp, 
    color: 'text-blue-400',
    payload: { type: 'smaNode', data: { period: 200 } } 
  },
  { 
    id: 'buy', 
    label: 'Buy Action', 
    sub: 'Execute', 
    icon: ShoppingCart, 
    color: 'text-emerald-400',
    payload: { type: 'actionNode', data: { actionType: 'Buy' } } 
  },
  { 
    id: 'sell', 
    label: 'Sell Action', 
    sub: 'Execute', 
    icon: MousePointer2, 
    color: 'text-red-400',
    payload: { type: 'actionNode', data: { actionType: 'Sell' } } 
  },
];

export default function Sidebar() {
  const onDragStart = (e: React.DragEvent, payload: DragPayload) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="absolute left-6 top-24 bottom-6 w-64 z-20 flex flex-col gap-4 pointer-events-none">
      
      {/* Glass Panel */}
      <div className="bg-neutral-950/80 backdrop-blur-xl border border-white/5 rounded-xl p-4 shadow-2xl pointer-events-auto flex-1 flex flex-col">
        <div className="mb-6 border-b border-white/5 pb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-green-500" /> Component Library
          </h2>
          <p className="text-[10px] text-neutral-500 mt-1">Drag components to build logic</p>
        </div>

        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {SIDEBAR_ITEMS.map((item) => (
            <div
              key={item.id}
              onDragStart={(event) => onDragStart(event, item.payload)}
              draggable
              className="group bg-neutral-900/50 border border-white/5 hover:border-green-500/50 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all hover:bg-neutral-800"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded bg-neutral-950 border border-white/5 group-hover:border-green-500/20 ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-200 group-hover:text-white">{item.label}</div>
                  <div className="text-[10px] text-neutral-600 font-mono">{item.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Decorative Footer */}
        <div className="mt-auto pt-4 border-t border-white/5 text-center">
          <div className="text-[9px] text-neutral-600 font-mono uppercase tracking-widest">
            Drag & Drop Engine
          </div>
        </div>
      </div>
    </div>
  );
}