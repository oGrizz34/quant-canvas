'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { supabase } from '@/lib/supabase';

type StrategyRow = {
  id: string;
  name: string | null;
  created_at: string;
  win_rate?: number | null;
  return_pct?: number | null;
  trade_count?: number | null;
};

type SignalRow = {
  id: string;
  ticker: string | null;
  type: string | null;
  message: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [strategies, setStrategies] = useState<StrategyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(true);

  const fetchStrategies = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('strategies')
      .select('id, name, created_at, win_rate, return_pct, trade_count')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) setStrategies([]);
    else setStrategies((data ?? []) as StrategyRow[]);
  }, []);

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setChecked(true);
      await fetchStrategies();
      setLoading(false);
    };
    run();
  }, [router, fetchStrategies]);

  useEffect(() => {
    if (!checked) return;

    let isMounted = true;

    const fetchSignals = async () => {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!isMounted) return;
      if (!error) {
        setSignals((data ?? []) as SignalRow[]);
      }
      setSignalsLoading(false);
    };

    fetchSignals();
    const intervalId = setInterval(fetchSignals, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [checked]);

  const handleDelete = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!confirm('Delete this strategy?')) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from('strategies').delete().eq('id', id).eq('user_id', user.id);
      if (error) {
        toast.error('Failed to delete');
      } else {
        setStrategies((prev) => prev.filter((s) => s.id !== id));
        toast.success('Strategy Deleted');
      }
    },
    []
  );

  if (!checked) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#111]">
        <div className="font-mono text-[#39ff14]">Loading…</div>
      </div>
    );
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
  };

  const getSignalTypeClass = (type: string | null) => {
    const t = (type ?? '').toUpperCase();
    if (t === 'BUY') return 'text-emerald-400';
    if (t === 'SELL') return 'text-red-400';
    if (t === 'INFO') return 'text-gray-400';
    return 'text-[#ccc]';
  };

  return (
    <div className="relative min-h-screen w-full bg-[#111]">
      <Toaster position="top-center" theme="dark" toastOptions={{ classNames: { success: '!border-[#39ff14]', error: '!border-red-500' } }} />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #39ff14 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <h1 className="font-mono text-xl font-semibold uppercase tracking-wider text-[#39ff14]">
                My Strategies
              </h1>
              <Link
                href="/"
                className="rounded-lg border border-[#39ff14] bg-[#39ff14]/10 px-4 py-2 font-mono text-sm font-semibold text-[#39ff14] transition-colors hover:bg-[#39ff14]/20"
              >
                Create New
              </Link>
            </header>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="font-mono text-[#888]">Loading strategies…</div>
              </div>
            ) : strategies.length === 0 ? (
              <div className="rounded-xl border-2 border-[#333] bg-[#1a1a1a] p-12 text-center">
                <p className="mb-4 font-mono text-[#888]">No strategies yet.</p>
                <Link
                  href="/"
                  className="inline-block rounded-lg border border-[#39ff14] bg-[#39ff14]/10 px-4 py-2 font-mono text-sm font-semibold text-[#39ff14] hover:bg-[#39ff14]/20"
                >
                  Create your first strategy
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {strategies.map((s) => (
                  <div
                    key={s.id}
                    className="group relative flex flex-col justify-between rounded-xl border-2 border-[#333] bg-[#1a1a1a] p-4 shadow-lg transition-colors hover:border-[#39ff14]/60 hover:shadow-[#39ff14]/10"
                  >
                    <button
                      type="button"
                      onClick={(e) => handleDelete(s.id, e)}
                      className="absolute right-2 top-2 rounded p-1 text-red-500 transition-colors hover:bg-red-500/20 hover:text-red-400"
                      aria-label="Delete strategy"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link href={`/?id=${s.id}`} className="block pr-8">
                      <h2 className="mb-2 font-mono text-sm font-semibold text-white group-hover:text-[#39ff14]">
                        {s.name ?? 'Untitled'}
                      </h2>
                      <time className="font-mono text-xs text-[#666]">{formatDate(s.created_at)}</time>
                    </Link>
                    <div className="mt-4 rounded-lg border border-[#333] bg-black/40 px-3 py-2 text-xs font-mono">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wide text-[#777]">
                          Performance
                        </span>
                        <span className="text-[10px] text-[#555]">
                          {s.trade_count ?? 0} trades
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-wide text-[#777]">Win Rate</span>
                          <div
                            className={`text-sm font-semibold ${
                              (s.win_rate ?? 0) > 50 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {s.win_rate != null ? `${s.win_rate.toFixed(1)}%` : '—'}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wide text-[#777]">Return</span>
                          <div
                            className={`text-sm font-semibold ${
                              (s.return_pct ?? 0) > 0
                                ? 'text-emerald-400'
                                : (s.return_pct ?? 0) < 0
                                ? 'text-red-400'
                                : 'text-[#ccc]'
                            }`}
                          >
                            {s.return_pct != null
                              ? `${s.return_pct > 0 ? '+' : ''}${s.return_pct.toFixed(2)}%`
                              : '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="w-full lg:w-80 xl:w-96">
            <h2 className="mb-3 font-mono text-sm font-semibold uppercase tracking-wider text-[#39ff14]">
              Live Activity Feed
            </h2>
            <div className="max-h-[480px] overflow-y-auto rounded-xl border-2 border-[#333] bg-[#1a1a1a] p-4">
              {signalsLoading ? (
                <div className="py-6 text-center font-mono text-xs text-[#888]">
                  Loading recent signals…
                </div>
              ) : signals.length === 0 ? (
                <div className="py-6 text-center font-mono text-xs text-[#888]">
                  No recent signals yet.
                </div>
              ) : (
                <ul className="space-y-2 font-mono text-xs text-[#ccc]">
                  {signals.map((s) => (
                    <li key={s.id} className="flex flex-col rounded-md bg-black/20 px-2 py-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase tracking-wide text-[#888]">
                          {new Date(s.created_at).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="mt-0.5">
                        <span className="mr-2 font-semibold text-[#39ff14]">
                          [{s.ticker ?? 'TICKER'}]
                        </span>
                        <span className={`mr-2 font-semibold ${getSignalTypeClass(s.type)}`}>
                          {(s.type ?? '').toUpperCase() || 'INFO'}
                        </span>
                        <span className="text-[#ccc]">
                          - {s.message ?? 'No message'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
