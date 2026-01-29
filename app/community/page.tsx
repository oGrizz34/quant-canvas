'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type PublicStrategy = {
  id: string;
  name: string | null;
  author_name: string | null;
};

export default function CommunityPage() {
  const router = useRouter();
  const [strategies, setStrategies] = useState<PublicStrategy[]>([]);
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
        .select('id, name, author_name')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        setStrategies([]);
      } else {
        setStrategies((data ?? []) as PublicStrategy[]);
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
            Trading Leaderboard
          </h1>
          <Link
            href="/"
            className="rounded-lg border border-[#333] bg-[#1a1a1a] px-4 py-2 font-mono text-sm font-semibold text-white transition-colors hover:border-[#39ff14]/50 hover:text-[#39ff14]"
          >
            Back to Canvas
          </Link>
        </header>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="font-mono text-[#888]">Loading strategies…</div>
          </div>
        ) : strategies.length === 0 ? (
          <div className="rounded-xl border-2 border-[#333] bg-[#1a1a1a] p-12 text-center">
            <p className="font-mono text-[#888]">No public strategies yet. Publish one from your canvas.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {strategies.map((s, index) => (
              <div
                key={s.id}
                className="rounded-xl border-2 border-[#333] bg-[#1a1a1a] p-4 shadow-lg transition-colors hover:border-[#39ff14]/40 hover:shadow-[#39ff14]/10"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="inline-flex h-7 min-w-[2.5rem] items-center justify-center rounded-md bg-[#39ff14]/20 px-2 font-mono text-xs font-bold text-[#39ff14]">
                    #{index + 1}
                  </span>
                  <span className="rounded-md bg-[#222] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#39ff14]">
                    Win Rate 87%
                  </span>
                </div>
                <h2 className="mb-1 font-mono text-sm font-semibold text-white">
                  {s.name ?? 'Untitled'}
                </h2>
                <p className="mb-4 font-mono text-xs text-[#666]">
                  by {s.author_name ?? 'Anonymous'}
                </p>
                <Link
                  href={`/?clone=${s.id}`}
                  className="block w-full rounded-lg border border-[#39ff14] bg-[#39ff14]/10 py-2 text-center font-mono text-sm font-semibold text-[#39ff14] transition-colors hover:bg-[#39ff14]/20"
                >
                  Clone
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
