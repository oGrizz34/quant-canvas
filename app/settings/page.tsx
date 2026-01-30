"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  User, 
  Mail, 
  Shield, 
  CreditCard, 
  Check, 
  LayoutGrid, 
  ChevronLeft,
  Save,
  Loader2,
  Zap
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');

  // Fetch User Data on Load
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // If we stored name in metadata, load it
        setFullName(user.user_metadata?.full_name || '');
      }
    };
    getUser();
  }, []);

  // Handle Profile Update
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) alert(error.message);
    else alert('Password reset email sent!');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-green-500/30">
      
      {/* 1. GLOBAL AMBIENT GLOW */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/10 via-neutral-950/0 to-neutral-950 pointer-events-none" />

      {/* 2. TOP NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <span className="font-bold text-lg tracking-tight text-white">
            Account <span className="text-green-500">Settings</span>
          </span>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* 3. MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8 relative">
        
        {/* SECTION: PERSONAL INFO */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-green-500" /> Personal Information
          </h2>
          <div className="bg-neutral-900/50 backdrop-blur-md border border-white/5 rounded-xl p-6 space-y-6">
            
            {/* Full Name Input */}
            <div className="space-y-2">
              <label className="text-sm text-neutral-400 font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Email Input (Read Only) */}
            <div className="space-y-2">
              <label className="text-sm text-neutral-400 font-medium">Email Address</label>
              <div className="relative opacity-50 cursor-not-allowed">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                <input 
                  type="email" 
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 pl-10 pr-4 text-neutral-400"
                />
              </div>
              <p className="text-xs text-neutral-600">Email cannot be changed directly for security reasons.</p>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button 
                onClick={handleUpdateProfile}
                disabled={loading}
                className="bg-green-600 hover:bg-green-500 text-black font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </section>

        {/* SECTION: SUBSCRIPTION */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-500" /> Subscription Plan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CURRENT PLAN */}
            <div className="bg-neutral-900/50 backdrop-blur-md border border-green-500/30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-500/10 text-green-500 text-[10px] font-bold px-3 py-1 rounded-bl-lg border-l border-b border-green-500/20">
                CURRENT PLAN
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Free Tier</h3>
              <p className="text-neutral-400 text-sm mb-6">Basic algo-trading access</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-neutral-300">
                  <Check className="w-4 h-4 text-green-500" /> 1 Active Strategy
                </li>
                <li className="flex items-center gap-2 text-sm text-neutral-300">
                  <Check className="w-4 h-4 text-green-500" /> Standard Polling (60s)
                </li>
                <li className="flex items-center gap-2 text-sm text-neutral-300">
                  <Check className="w-4 h-4 text-green-500" /> Discord Alerts
                </li>
              </ul>
            </div>

            {/* PRO PLAN UPGRADE */}
            <div className="bg-neutral-900/30 border border-dashed border-neutral-800 rounded-xl p-6 flex flex-col justify-center items-center text-center hover:border-green-500/30 transition-colors group">
              <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Upgrade to Pro</h3>
              <p className="text-neutral-500 text-sm mb-6">Unlock unlimited strategies & faster speeds.</p>
              <button className="w-full bg-white text-black font-bold py-2 rounded-lg hover:bg-neutral-200 transition-colors">
                View Pricing
              </button>
            </div>
          </div>
        </section>

        {/* SECTION: SECURITY */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" /> Security
          </h2>
          <div className="bg-neutral-900/50 backdrop-blur-md border border-white/5 rounded-xl p-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">Password</h3>
              <p className="text-sm text-neutral-400">Manage your password settings via email.</p>
            </div>
            <button 
              onClick={handlePasswordReset}
              className="border border-neutral-700 hover:border-white text-neutral-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Reset Password
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}