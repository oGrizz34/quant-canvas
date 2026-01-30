"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Briefcase 
} from 'lucide-react';

type Trade = {
  id: number;
  ticker: string;
  entry_price: number;
  entry_time: string;
  exit_price?: number;
  exit_time?: string;
  profit?: number;
  status: 'OPEN' | 'CLOSED';
  strategy_id: number;
};

export default function Portfolio() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      const { data } = await supabase
        .from('trades')
        .select('*')
        .order('entry_time', { ascending: false });
      
      if (data) setTrades(data);
      setLoading(false);
    };

    fetchTrades();
    // Subscribe to live updates (so the UI updates instantly when the bot buys)
    const channel = supabase
      .channel('trades_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, fetchTrades)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Filter Data
  const openPositions = trades.filter(t => t.status === 'OPEN');
  const history = trades.filter(t => t.status === 'CLOSED');
  
  // Calculate Totals
  const totalProfit = history.reduce((sum, t) => sum + (t.profit || 0), 0);
  const winCount = history.filter(t => (t.profit || 0) > 0).length;
  const winRate = history.length > 0 ? ((winCount / history.length) * 100).toFixed(1) : "0.0";

  if (loading) return <div className="text-neutral-500 text-sm animate-pulse">Loading portfolio data...</div>;

  return (
    <div className="space-y-6">
      
      {/* 1. PORTFOLIO SUMMARY HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Profit Card */}
        <div className="bg-neutral-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Realized Profit</div>
            <div className={`text-2xl font-mono font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${totalProfit.toFixed(2)}
            </div>
          </div>
          <div className={`p-2 rounded-lg ${totalProfit >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Win Rate Card */}
        <div className="bg-neutral-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Win Rate</div>
            <div className="text-2xl font-mono font-bold text-white">
              {winRate}%
            </div>
          </div>
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Active Positions Card */}
        <div className="bg-neutral-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Open Positions</div>
            <div className="text-2xl font-mono font-bold text-white">
              {openPositions.length}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. OPEN POSITIONS (The "Holdings" List) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> Current Holdings
        </h3>
        
        {openPositions.length === 0 ? (
          <div className="p-6 border border-dashed border-neutral-800 rounded-xl text-center text-sm text-neutral-500 bg-neutral-900/30">
            No active positions. The engines are scanning...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {openPositions.map((trade) => (
              <div key={trade.id} className="bg-neutral-900/80 border-l-4 border-green-500 border-y border-r border-white/5 p-4 rounded-r-xl flex items-center justify-between group hover:bg-neutral-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-neutral-950 p-2 rounded text-lg font-bold text-white font-mono border border-white/10">
                    {trade.ticker}
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase">Entry Price</div>
                    <div className="text-sm font-mono text-green-400 font-bold">${trade.entry_price.toFixed(2)}</div>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-[10px] text-neutral-500 uppercase">Entry Time</div>
                    <div className="text-xs text-neutral-400 font-mono">
                      {new Date(trade.entry_time).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded border border-green-500/20">
                  OPEN
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. TRADE HISTORY (The Ledger) */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <h3 className="text-sm font-bold text-neutral-400 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Recent History
        </h3>
        
        <div className="overflow-hidden rounded-xl border border-white/5 bg-neutral-900/30">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-950 text-neutral-500 font-medium border-b border-white/5">
              <tr>
                <th className="p-3 pl-4">Ticker</th>
                <th className="p-3">Result</th>
                <th className="p-3 text-right">Profit</th>
                <th className="p-3 text-right pr-4">Exit Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-neutral-600 italic">No closed trades yet.</td>
                </tr>
              ) : history.map((trade) => (
                <tr key={trade.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 pl-4 font-mono font-bold text-white">{trade.ticker}</td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${
                      (trade.profit || 0) >= 0 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {(trade.profit || 0) >= 0 ? 'WIN' : 'LOSS'}
                    </span>
                  </td>
                  <td className={`p-3 text-right font-mono font-bold ${(trade.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(trade.profit || 0) >= 0 ? '+' : ''}${(trade.profit || 0).toFixed(2)}
                  </td>
                  <td className="p-3 text-right text-neutral-500 text-xs font-mono pr-4">
                    {new Date(trade.exit_time || '').toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}