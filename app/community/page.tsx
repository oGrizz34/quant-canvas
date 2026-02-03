"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Search, 
  Copy, 
  Star, 
  TrendingUp, 
  Users, 
  Download,
  Lock,
  Globe
} from 'lucide-react';

type Strategy = {
  id: number;
  name: string;
  description: string;
  author_name: string;
  win_rate: number;
  return_pct: number;
  clone_count: number;
  type: string;
};

export default function CommunityPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fake "Pro" check (Set to true to test the clone button)
  const isPro = true; 

  useEffect(() => {
    fetchPublicStrategies();
  }, []);

  const fetchPublicStrategies = async () => {
    const { data } = await supabase
      .from('strategies')
      .select('*')
      .eq('is_public', true)
      .order('return_pct', { ascending: false }); // Show best earners first
    
    if (data) setStrategies(data);
    setLoading(false);
  };

  const cloneStrategy = async (strategy: Strategy) => {
    if (!isPro) {
      alert("Upgrade to PRO to clone strategies!");
      return;
    }
    
    if(!confirm(`Clone "${strategy.name}" to your dashboard?`)) return;

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) return;

    // 2. Insert copy into user's dashboard
    const { error } = await supabase.from('strategies').insert({
      name: `${strategy.name} (Copy)`,
      user_id: user.id, // Assign to YOU
      type: strategy.type,
      is_active: false, // Start paused safety
      win_rate: strategy.win_rate, // Inherit stats history
      return_pct: strategy.return_pct
    });

    if (error) {
      alert('Error cloning strategy.');
      console.error(error);
    } else {
      alert('Strategy cloned! Check your dashboard.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans p-8">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-green-500/20">
          <Globe className="w-3 h-3" /> Community Library
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Discover Winning Strategies</h1>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          Browse the highest performing algorithms from the community. 
          <span className="text-white font-bold"> Clone</span> them to your dashboard to start trading instantly.
        </p>
      </div>

      {/* Search & Filter Bar (Visual only for now) */}
      <div className="max-w-7xl mx-auto mb-8 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Search strategies (e.g. 'Momentum', 'Scalp')..." 
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-green-500 focus:outline-none transition-colors"
          />
        </div>
        <button className="bg-neutral-900 border border-neutral-800 px-6 rounded-xl font-bold text-neutral-400 hover:text-white transition-colors">
          Filters
        </button>
      </div>

      {/* The Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {strategies.map((strat) => (
          <div key={strat.id} className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 hover:border-green-500/30 transition-all group relative overflow-hidden">
            
            {/* Top Badge */}
            <div className="flex justify-between items-start mb-4">
              <div className="bg-neutral-800 text-neutral-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                {strat.type}
              </div>
              {strat.return_pct > 20 && (
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3 h-3 fill-amber-400" /> Top Pick
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{strat.name}</h3>
            <p className="text-neutral-400 text-sm mb-6 line-clamp-2">{strat.description}</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mb-6 bg-neutral-950/50 rounded-lg p-3 border border-white/5">
              <div>
                <div className="text-[10px] text-neutral-500 uppercase font-bold">Return</div>
                <div className="text-green-400 font-mono font-bold text-lg">+{strat.return_pct}%</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-500 uppercase font-bold">Win Rate</div>
                <div className="text-white font-mono font-bold text-lg">{strat.win_rate}%</div>
              </div>
            </div>

            {/* Author & Action */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold">
                  {strat.author_name.charAt(0)}
                </div>
                <span className="text-xs text-neutral-500">by {strat.author_name}</span>
              </div>

              <button 
                onClick={() => cloneStrategy(strat)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isPro ? 'bg-white text-black hover:bg-green-400' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
              >
                {isPro ? <Copy className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {isPro ? 'Clone' : 'Pro Only'}
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}