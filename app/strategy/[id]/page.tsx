"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Download, 
  Lock, 
  Calendar,
  DollarSign
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// --- TYPES ---
type Trade = {
  id: number;
  entry_time: string;
  exit_time: string;
  profit: number;
  ticker: string;
  status: 'OPEN' | 'CLOSED';
};

type StrategyStats = {
  name: string;
  total_profit: number;
  win_rate: number;
  profit_factor: number;
  avg_win: number;
  avg_loss: number;
  trades_count: number;
};

export default function StrategyAnalytics() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategyName, setStrategyName] = useState("Loading...");
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fake "Pro" Status for development (Set to false to see the upsell)
  const isPro = true; 

  useEffect(() => {
    const fetchData = async () => {
      if(!id) return;

      // 1. Get Strategy Details
      const { data: strat } = await supabase.from('strategies').select('name').eq('id', id).single();
      if (strat) setStrategyName(strat.name);

      // 2. Get Trade History
      const { data: tradeData } = await supabase
        .from('trades')
        .select('*')
        .eq('strategy_id', id)
        .eq('status', 'CLOSED')
        .order('exit_time', { ascending: true }); // Oldest first for the chart

      if (tradeData) {
        setTrades(tradeData);
        
        // 3. Build Equity Curve (Cumulative Profit)
        let runningTotal = 0;
        const curve = tradeData.map(t => {
          runningTotal += t.profit || 0;
          return {
            date: new Date(t.exit_time).toLocaleDateString(),
            profit: runningTotal,
            rawDate: t.exit_time
          };
        });
        setChartData(curve);
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  // --- CALCULATE ADVANCED METRICS ---
  const wins = trades.filter(t => t.profit > 0);
  const losses = trades.filter(t => t.profit <= 0);
  const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
  const totalWinAmt = wins.reduce((sum, t) => sum + t.profit, 0);
  const totalLossAmt = Math.abs(losses.reduce((sum, t) => sum + t.profit, 0));

  // "Profit Factor" is the Holy Grail metric for traders
  // (Gross Profit / Gross Loss). > 1.5 is good. > 2.0 is amazing.
  const profitFactor = totalLossAmt === 0 ? totalWinAmt : (totalWinAmt / totalLossAmt);
  const winRate = trades.length > 0 ? ((wins.length / trades.length) * 100).toFixed(1) : "0.0";
  const avgWin = wins.length > 0 ? (totalWinAmt / wins.length) : 0;
  const avgLoss = losses.length > 0 ? (totalLossAmt / losses.length) : 0;

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-green-500 animate-pulse">Analysing Algo Performance...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans p-6 selection:bg-green-500/30">
      
      {/* 1. HEADER */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors border border-white/5">
            <ArrowLeft className="w-5 h-5 text-neutral-400" />
          </Link>
          <div>
            <div className="text-[10px] text-green-500 font-mono uppercase tracking-widest mb-1">Analytics Report</div>
            <h1 className="text-3xl font-bold text-white">{strategyName}</h1>
          </div>
        </div>
        
        {/* CSV Export (Pro Feature) */}
        <button disabled={!isPro} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${isPro ? 'bg-neutral-900 border-white/10 hover:bg-white hover:text-black' : 'bg-neutral-900/50 text-neutral-600 border-neutral-800 cursor-not-allowed'}`}>
          {isPro ? <Download className="w-4 h-4" /> : <Lock className="w-3 h-3" />}
          Export CSV
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* 2. THE EQUITY CURVE (The "Money Shot") */}
        {/* This is what sells the Pro subscription */}
        <div className="bg-neutral-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" /> Equity Curve
            </h2>
            <div className="flex gap-2">
              {['1D', '1W', '1M', 'YTD', 'ALL'].map(period => (
                <button key={period} className={`text-[10px] font-bold px-2 py-1 rounded border ${period === 'ALL' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-neutral-950 text-neutral-500 border-neutral-800'}`}>
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px] w-full">
            {isPro ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#888' }}
                  />
                  <Area type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              // BLURRED STATE FOR FREE USERS
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm z-10">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-green-500 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white">Unlock Pro Analytics</h3>
                  <p className="text-neutral-400 text-sm mb-4">View detailed equity curves and drawdown analysis.</p>
                  <button className="bg-green-600 hover:bg-green-500 text-black font-bold py-2 px-6 rounded-lg transition-colors">Upgrade to Pro</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. KEY METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Total Profit (Free) */}
          <div className="bg-neutral-900/50 border border-white/5 p-5 rounded-xl">
            <div className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider mb-2">Total Net Profit</div>
            <div className={`text-3xl font-mono font-bold ${totalProfit >= 0 ? 'text-white' : 'text-red-500'}`}>
              ${totalProfit.toFixed(2)}
            </div>
          </div>

          {/* Win Rate (Free) */}
          <div className="bg-neutral-900/50 border border-white/5 p-5 rounded-xl">
            <div className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider mb-2">Win Rate</div>
            <div className="text-3xl font-mono font-bold text-white">
              {winRate}%
            </div>
            <div className="text-xs text-neutral-500 mt-1">{wins.length} Wins / {losses.length} Losses</div>
          </div>

          {/* Profit Factor (PRO) */}
          <div className="bg-neutral-900/50 border border-purple-500/20 p-5 rounded-xl relative overflow-hidden">
             {!isPro && <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-[2px] z-10 flex items-center justify-center"><Lock className="w-4 h-4 text-neutral-500" /></div>}
            <div className="text-purple-400 text-[10px] uppercase font-bold tracking-wider mb-2">Profit Factor</div>
            <div className="text-3xl font-mono font-bold text-white">
              {profitFactor.toFixed(2)}
            </div>
            <div className="text-xs text-neutral-500 mt-1">Target: &gt; 1.5</div>
          </div>

          {/* Avg Trade (PRO) */}
          <div className="bg-neutral-900/50 border border-blue-500/20 p-5 rounded-xl relative overflow-hidden">
            {!isPro && <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-[2px] z-10 flex items-center justify-center"><Lock className="w-4 h-4 text-neutral-500" /></div>}
            <div className="text-blue-400 text-[10px] uppercase font-bold tracking-wider mb-2">Avg Win / Loss</div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-mono font-bold text-green-400">${avgWin.toFixed(0)}</span>
              <span className="text-sm font-mono text-neutral-600">/</span>
              <span className="text-xl font-mono font-bold text-red-400">-${avgLoss.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* 4. TRADE LOG */}
        <div className="border-t border-white/5 pt-8">
          <h3 className="text-lg font-bold text-white mb-4">Execution History</h3>
          <div className="bg-neutral-900/30 rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-950 text-neutral-500 font-medium border-b border-white/5">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Ticker</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Profit/Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {trades.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-neutral-500">No closed trades yet.</td></tr>
                ) : trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-neutral-400 font-mono text-xs">{new Date(trade.exit_time).toLocaleString()}</td>
                    <td className="p-4 font-bold text-white">{trade.ticker}</td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${trade.profit > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {trade.profit > 0 ? 'WIN' : 'LOSS'}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-mono font-bold ${trade.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.profit > 0 ? '+' : ''}{trade.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}