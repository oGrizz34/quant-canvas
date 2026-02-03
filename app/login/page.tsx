"use client";
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr'; // <--- NEW: Uses Cookies, not LocalStorage
import { useRouter } from 'next/navigation';
import { Cpu, Lock, ArrowRight, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. INITIALIZE THE COOKIE-AWARE CLIENT
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 2. AUTO-REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard'); 
        router.refresh();
      }
    };
    checkSession();
  }, [router, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Refresh ensures the Middleware sees the new cookie immediately
      router.refresh();
      router.push('/dashboard');
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      setError('Check your email for the confirmation link!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 selection:bg-green-500/30 font-sans">
      
      {/* Background Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-neutral-950/50 to-neutral-950 pointer-events-none" />

      <div className="w-full max-w-md bg-neutral-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-2xl shadow-2xl relative z-10">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)] mb-4">
            <Cpu className="w-7 h-7 text-black" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-white mb-2">Welcome Back</h1>
        <p className="text-neutral-500 text-center text-sm mb-8">Enter your credentials to access the terminal.</p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-600" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-neutral-700"
                placeholder="trader@quantcanvas.io"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-600" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-neutral-700"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-bold py-2.5 rounded-lg hover:bg-green-400 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Access Terminal'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/5 text-center">
          <p className="text-neutral-500 text-xs mb-3">No account?</p>
          <button 
            onClick={handleSignUp}
            disabled={loading}
            className="text-white text-xs font-bold hover:text-green-400 transition-colors"
          >
            Create New Account
          </button>
        </div>

      </div>
      
      <div className="mt-8 text-[10px] text-neutral-600 font-mono">
        SECURE CONNECTION • ENCRYPTED END-TO-END
      </div>
    </div>
  );
}