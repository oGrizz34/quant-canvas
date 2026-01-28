'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';

type Tab = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/');
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(error.message);
          setLoading(false);
          return;
        }
        toast.success('Welcome back');
        router.push('/');
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          toast.error(error.message);
          setLoading(false);
          return;
        }
        toast.success('Account created. Check your email to confirm.');
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#111]">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #39ff14 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <Toaster position="top-center" theme="dark" toastOptions={{ classNames: { success: '!border-[#39ff14]', error: '!border-red-500' } }} />
      <div className="relative z-10 w-full max-w-sm rounded-xl border-2 border-[#39ff14]/50 bg-[#1a1a1a] p-6 shadow-xl shadow-[#39ff14]/10">
        <h1 className="mb-6 font-mono text-lg font-semibold uppercase tracking-wider text-[#39ff14]">
          QuantCanvas
        </h1>
        <div className="mb-4 flex rounded-lg border border-[#333] bg-[#222] p-0.5">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 rounded-md py-2 font-mono text-sm font-medium transition-colors ${
              tab === 'login'
                ? 'bg-[#39ff14]/20 text-[#39ff14]'
                : 'text-[#888] hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={`flex-1 rounded-md py-2 font-mono text-sm font-medium transition-colors ${
              tab === 'signup'
                ? 'bg-[#39ff14]/20 text-[#39ff14]'
                : 'text-[#888] hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block font-mono text-xs text-[#888]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[#333] bg-[#222] px-3 py-2 font-mono text-sm text-white placeholder-[#666] focus:border-[#39ff14] focus:outline-none focus:ring-1 focus:ring-[#39ff14]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-mono text-xs text-[#888]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-[#333] bg-[#222] px-3 py-2 font-mono text-sm text-white placeholder-[#666] focus:border-[#39ff14] focus:outline-none focus:ring-1 focus:ring-[#39ff14]"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border border-[#39ff14] bg-[#39ff14]/10 py-2 font-mono text-sm font-semibold text-[#39ff14] transition-colors hover:bg-[#39ff14]/20 disabled:opacity-50"
          >
            {loading ? '…' : tab === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
