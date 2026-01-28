'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

export type ActionNodeData = {
  actionType: 'Buy' | 'Sell';
};

function ActionNodeComponent({ data }: NodeProps<ActionNodeData>) {
  const actionType = data.actionType ?? 'Buy';
  const isBuy = actionType === 'Buy';

  return (
    <div className="min-w-[140px] rounded-xl border-2 border-[#39ff14] bg-[#1a1a1a] px-4 py-3 shadow-lg shadow-[#39ff14]/10">
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !border-2 !border-[#39ff14] !bg-[#111]" />
      <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#888]">
        Action
      </div>
      <span
        className={`inline-block rounded-md px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider ${
          isBuy
            ? 'bg-[#39ff14]/20 text-[#39ff14]'
            : 'bg-red-500/20 text-red-400'
        }`}
      >
        {actionType}
      </span>
    </div>
  );
}

const ActionNode = memo(ActionNodeComponent);
export default ActionNode;
