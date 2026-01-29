"use client";
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data, isConnectable }: any) => {
  return (
    // 1. Changed bg-slate-900 to bg-black to match other nodes
    // 2. Removed the heavy shadow to make it cleaner
    <div className="bg-black border border-green-500 rounded-lg p-3 w-40 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
      
      {/* Header: Removed the circle icon to match "PRICE" and "RSI" headers */}
      <div className="mb-3 border-b border-green-900/50 pb-1">
        <span className="text-green-500 font-mono font-bold text-xs uppercase tracking-wider">
          SMA Filter
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex flex-col">
           <label className="text-[10px] text-gray-500 mb-1 font-mono uppercase">Period</label>
           <input
            className="nodrag w-full bg-neutral-900 text-green-400 text-xs p-1.5 rounded border border-neutral-800 focus:border-green-500 outline-none font-mono text-center"
            type="number"
            defaultValue={data.period || 200}
            onChange={(evt) => data.onChange?.({ ...data, period: evt.target.value })}
          />
        </div>
        
        <div className="text-[9px] text-green-700 text-center font-mono pt-1">
          "Buy if &gt; SMA"
        </div>
      </div>

      {/* Handles: Styled to look like little circles (black center, green border) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        isConnectable={isConnectable} 
        className="w-2 h-2 bg-black border border-green-500" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        isConnectable={isConnectable} 
        className="w-2 h-2 bg-black border border-green-500" 
      />
    </div>
  );
});