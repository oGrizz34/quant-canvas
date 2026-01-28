'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type StrategyRow = {
  id: string;
  name: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [strategies, setStrategies] = useState<StrategyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setChecked(true);

      const { data, error } = await supabase
        .from('strategies')
        .select('id, name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setStrategies([]);
      } else {
        setStrategies((data ?? []) as StrategyRow[]);
      }
      setLoading(false);
    };
    run();
  }, [router]);

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

  return (
    <div className="relative min-h-screen w-full bg-[#111]">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #39ff14 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8">
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
              <Link
                key={s.id}
                href={`/?id=${s.id}`}
                className="group block rounded-xl border-2 border-[#333] bg-[#1a1a1a] p-4 shadow-lg transition-colors hover:border-[#39ff14]/60 hover:shadow-[#39ff14]/10"
              >
                <h2 className="mb-2 font-mono text-sm font-semibold text-white group-hover:text-[#39ff14]">
                  {s.name ?? 'Untitled'}
                </h2>
                <time className="font-mono text-xs text-[#666]">{formatDate(s.created_at)}</time>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
