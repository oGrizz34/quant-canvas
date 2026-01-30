"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
// FIXED: Correct Portfolio import path
import Portfolio from '@/components/Portfolio';
import { supabase } from '@/lib/supabase';
import { 
  Activity, 
  Plus, 
  Trash2, 
  Zap, 
  LayoutGrid, 
  Cpu, 
  Settings,
  Wallet 
} from 'lucide-react';

// --- TYPES ---
type Strategy = {
  id: number;
  name: string;
  created_at: string;
  win_rate?: number;
  return_pct?: number;
  trade_count?: number;
  is_active?: boolean; // New field for the toggle
};

type SignalRow = {
  id: string;
  created_at: string;
  ticker: string;
  message: string;
  type: string | null;
};

export default function DashboardPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [loading, setLoading] = useState(true);

  // --- DATA FETCHING ---
  const fetchStrategies = async () => {
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .order('id', { ascending: false });
    if (error) console.error('Error fetching strategies:', error);
    else setStrategies(data || []);
  };

  const deleteStrategy = async (id: number) => {
    if (!confirm('Are you sure you want to delete this strategy?')) return;
    const { error } = await supabase.from('strategies').delete().eq('id', id);
    if (!error) fetchStrategies();
  };

  // --- NEW: TOGGLE STATUS FUNCTION ---
  const toggleStatus = async (id: number, currentStatus: boolean) => {
    // 1. Optimistic UI update (Update screen instantly before DB responds)
    setStrategies(strategies.map(s => 
      s.id === id ? { ...s, is_active: !currentStatus } : s
    ));

    // 2. Send update to Supabase
    const { error } = await supabase
      .from('strategies')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    // 3. Revert if it fails
    if (error) {
      console.error('Error updating status:', error);
      fetchStrategies(); 
    }
  };

  useEffect(() => {
    fetchStrategies();

    // Live Feed Polling
    const fetchSignals = async () => {
      const { data } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (data) setSignals(data);
    };

    fetchSignals();
    const interval = setInterval(fetchSignals, 5000);
    setLoading(false);
    return () => clearInterval(interval);
  }, []);

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-green-500/30">
      
      {/* 1. GLOBAL AMBIENT GLOW */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-neutral-950/0 to-neutral-950 pointer-events-none" />

      {/* 2. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)]">
              <Cpu className="text-black w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Quant<span className="text-green-500">Canvas</span>
            </span>
            <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full border border-neutral-700 ml-2">PRO</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium text-neutral-400">
            <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <LayoutGrid className="w-4 h-4" /> Dashboard
            </div>
            {/* ... Dashboard link above ... */}
            
            <Link href="/settings">
              <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <Settings className="w-4 h-4" /> Settings
              </div>
            </Link>

            {/* ... Vertical line divider below ... */}
            <div className="h-4 w-px bg-white/10" />
            <div className="text-green-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              System Online
            </div>
          </div>
        </div>
      </header>

      {/* 3. MAIN DASHBOARD GRID */}
      <main className="relative max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: STRATEGIES (Span 8) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Active Strategies</h2>
              <p className="text-neutral-500 text-sm">Manage and monitor your algorithmic fleet</p>
            </div>
            <Link href="/?new=true">
              <button className="group flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                New Strategy
              </button>
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="text-neutral-500">Loading fleet data...</div>
            ) : strategies.length === 0 ? (
              <div className="col-span-2 border border-dashed border-neutral-800 rounded-xl p-12 text-center text-neutral-500">
                No active strategies. Launch your first bot.
              </div>
            ) : (
              strategies.map((strategy) => (
                <div key={strategy.id} className="group relative bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-5 hover:border-green-500/50 hover:bg-neutral-900/80 transition-all duration-300">
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center border border-white/5 group-hover:border-green-500/30 transition-colors">
                        <Activity className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-green-400 transition-colors">{strategy.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${strategy.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-neutral-800 text-neutral-500 border border-neutral-700'}`}>
                            {strategy.is_active ? 'ACTIVE' : 'PAUSED'}
                          </span>
                          <span className="text-[10px] text-neutral-600 font-mono">ID: {strategy.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* TOGGLE SWITCH & DELETE */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleStatus(strategy.id, strategy.is_active || false);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${strategy.is_active ? 'bg-green-600' : 'bg-neutral-700'}`}
                      >
                         <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${strategy.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>

                      <button 
                        onClick={(e) => { e.preventDefault(); deleteStrategy(strategy.id); }}
                        className="text-neutral-600 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Performance Badges */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-neutral-950/50 rounded-lg p-3 border border-white/5">
                      <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-1">Win Rate</div>
                      <div className={`text-xl font-mono font-bold ${
                        (strategy.win_rate || 0) >= 50 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {strategy.win_rate ? `${strategy.win_rate}%` : '--'}
                      </div>
                    </div>
                    <div className="bg-neutral-950/50 rounded-lg p-3 border border-white/5">
                      <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-1">Total Return</div>
                      <div className={`text-xl font-mono font-bold ${
                        (strategy.return_pct || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {strategy.return_pct ? `${strategy.return_pct > 0 ? '+' : ''}${strategy.return_pct}%` : '--'}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="text-xs text-neutral-500 font-mono">
                      {strategy.trade_count || 0} Trades Executed
                    </div>
                    <Link href={`/?id=${strategy.id}`}>
                      <span className="text-xs font-bold text-white hover:text-green-400 flex items-center gap-1 cursor-pointer">
                        OPEN TERMINAL →
                      </span>
                    </Link>
                  </div>
                </div>
              ))
            )}
            <div className="mt-8 pt-8 border-t border-white/5">
             <h2 className="text-xl font-bold text-white mb-6">Live Portfolio</h2>
             <Portfolio />
          </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE FEED (Span 4) */}
        <div className="col-span-12 lg:col-span-4">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-green-500" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Live Market Pulse</h2>
            </div>
            
            <div className="bg-neutral-900/50 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl h-[600px] flex flex-col">
              <div className="p-3 border-b border-white/5 bg-neutral-900/80 flex justify-between items-center">
                <span className="text-[10px] text-neutral-400 font-mono">SIGNAL STREAM</span>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {signals.map((signal) => {
                  const isBuy = signal.type === 'BUY';
                  const isSell = signal.type === 'SELL';
                  const isTest = signal.message.includes("TEST");
                  
                  let borderClass = "border-neutral-800";
                  let textClass = "text-neutral-400";
                  let bgClass = "bg-neutral-950/30";

                  if (isBuy) {
                    borderClass = "border-green-900/50";
                    textClass = "text-green-400";
                    bgClass = "bg-green-950/10";
                  } else if (isSell) {
                    borderClass = "border-red-900/50";
                    textClass = "text-red-400";
                    bgClass = "bg-red-950/10";
                  } else if (isTest) {
                    borderClass = "border-purple-900/50";
                    textClass = "text-purple-400";
                  }

                  return (
                    <div key={signal.id} className={`p-3 rounded border ${borderClass} ${bgClass} transition-all hover:bg-white/5`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-mono font-bold text-xs ${textClass} bg-neutral-950 px-1.5 py-0.5 rounded border border-white/5`}>
                          {signal.ticker || 'SYS'}
                        </span>
                        <span className="text-[10px] text-neutral-600 font-mono">
                          {new Date(signal.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-300 font-mono leading-relaxed">
                        {signal.type && <span className={`font-bold ${textClass} mr-2`}>[{signal.type}]</span>}
                        {signal.message}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="p-2 border-t border-white/5 bg-neutral-950 text-center">
                <span className="text-[10px] text-green-500 animate-pulse">● LIVE CONNECTION ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}