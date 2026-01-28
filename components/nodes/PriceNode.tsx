'use client';

import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { useReactFlow } from 'reactflow';

export type PriceNodeData = {
  ticker: string;
};

const TICKERS = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'AMZN', 'META', 'GOOGL'];

function PriceNodeComponent({ id, data }: NodeProps<PriceNodeData>) {
  const { setNodes } = useReactFlow();

  const onTickerChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setNodes((nodes) =>
        nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ticker: e.target.value } } : n
        )
      );
    },
    [id, setNodes]
  );

  const ticker = data.ticker ?? 'SPY';

  return (
    <div className="rounded-xl border-2 border-[#39ff14] bg-[#1a1a1a] px-4 py-3 shadow-lg shadow-[#39ff14]/10 min-w-[160px]">
      <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#39ff14]">
        Price
      </div>
      <label className="mb-1 block font-mono text-[10px] text-[#888]">Ticker</label>
      <select
        value={ticker}
        onChange={onTickerChange}
        className="w-full rounded border border-[#333] bg-[#222] px-2 py-1.5 font-mono text-sm text-white focus:border-[#39ff14] focus:outline-none focus:ring-1 focus:ring-[#39ff14]"
      >
        {TICKERS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !border-2 !border-[#39ff14] !bg-[#111]" />
    </div>
  );
}

const PriceNode = memo(PriceNodeComponent);
export default PriceNode;
