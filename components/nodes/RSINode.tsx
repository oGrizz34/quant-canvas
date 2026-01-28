'use client';

import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { useReactFlow } from 'reactflow';

export type RSINodeData = {
  period: number;
};

function RSINodeComponent({ id, data }: NodeProps<RSINodeData>) {
  const { setNodes } = useReactFlow();

  const onPeriodChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const parsed = raw === '' ? 14 : Math.max(1, Math.min(999, parseInt(raw, 10) || 14));
      setNodes((nodes) =>
        nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, period: parsed } } : n
        )
      );
    },
    [id, setNodes]
  );

  const period = typeof data.period === 'number' && data.period >= 1 ? data.period : 14;

  return (
    <div className="min-w-[160px] rounded-xl border-2 border-[#39ff14] bg-[#1a1a1a] px-4 py-3 shadow-lg shadow-[#39ff14]/10">
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !border-2 !border-[#39ff14] !bg-[#111]" />
      <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#39ff14]">
        RSI
      </div>
      <label className="mb-1 block font-mono text-[10px] text-[#888]">Period</label>
      <input
        type="number"
        min={1}
        max={999}
        value={period}
        onChange={onPeriodChange}
        className="w-full rounded border border-[#333] bg-[#222] px-2 py-1.5 font-mono text-sm text-white focus:border-[#39ff14] focus:outline-none focus:ring-1 focus:ring-[#39ff14]"
      />
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !border-2 !border-[#39ff14] !bg-[#111]" />
    </div>
  );
}

const RSINode = memo(RSINodeComponent);
export default RSINode;
