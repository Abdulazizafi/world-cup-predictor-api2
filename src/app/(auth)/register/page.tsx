'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { apiRegister } from '@/lib/api/client';
import { useAppStore } from '@/lib/store/useAppStore';

const getStrength = (pw: string) => {
  if (!pw) return null;
  if (pw.length < 6)  return { label: 'Too short', color: '#C1001A', pct: '20%' };
  if (pw.length < 8)  return { label: 'Weak',      color: '#E8531A', pct: '40%' };
  if (pw.length < 10) return { label: 'Good',       color: '#8DC63F', pct: '70%' };
  return                      { label: 'Strong',    color: '#007A6E', pct: '100%' };
};

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { setUser, user, hydrated } = useAppStore();
  const router  = useRouter();
  const strength = getStrength(password);

  // Redirect if already logged in
  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      router.replace(user.groupId ? '/dashboard' : '/group-setup');
    }
  }, [user, hydrated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      const user = await apiRegister(username.trim(), password);
      setUser(user);
      toast.success('Account created! Welcome to WC Predictor 2026');
      router.push('/group-setup');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-wc-pattern wc-arch-bg flex items-center justify-center px-4 py-12">
      <div className="fixed top-0 left-0 right-0 h-1.5 wc-stripes-bar z-50" />

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(ellipse, #6B3FA0 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-10"
          style={{ background: '#C1001A' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-4"
          >
            <Image src="/wc2026-logo.svg" alt="FIFA World Cup 2026" width={100} height={140}
              className="drop-shadow-[0_0_32px_rgba(107,63,160,0.7)]" priority />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight">
            Join the <span style={{ color: 'var(--wc-purple)' }}>League</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1 tracking-wide uppercase font-medium">FIFA World Cup 2026™</p>
        </div>

        <div className="glass rounded-2xl overflow-hidden shadow-card">
          <div className="h-1 wc-stripes-bar" />
          <div className="p-8">
            <h2 className="text-xl font-bold mb-2">Create account</h2>

            {/* Privacy badge */}
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-5 text-xs font-semibold"
              style={{ background: 'rgba(0,122,110,0.12)', border: '1px solid rgba(0,122,110,0.3)', color: '#4ECDC4' }}>
              <ShieldCheck size={14} className="shrink-0" />
              No email needed · Username only · Your data stays private
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4 text-sm"
                style={{ background: 'rgba(193,0,26,0.12)', border: '1px solid rgba(193,0,26,0.3)', color: '#ff6b6b' }}>
                <AlertCircle size={15} className="shrink-0" />{error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-300">Username</label>
                <input id="register-username" type="text" autoComplete="username"
                  placeholder="e.g. goat_fan_2026"
                  value={username} onChange={e => setUsername(e.target.value)} required
                  className="input-wc w-full px-4 py-3" />
                <p className="text-xs text-zinc-500">3–20 chars, letters, numbers and underscores</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-300">Password</label>
                <div className="relative">
                  <input id="register-password" type={showPw ? 'text' : 'password'}
                    autoComplete="new-password" placeholder="Min. 6 characters"
                    value={password} onChange={e => setPassword(e.target.value)} required
                    className="input-wc w-full px-4 py-3 pr-12" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1.5">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {strength && (
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div animate={{ width: strength.pct }} transition={{ duration: 0.3 }}
                        className="h-full rounded-full" style={{ background: strength.color }} />
                    </div>
                    <p className="text-xs text-zinc-400">{strength.label}</p>
                  </div>
                )}
              </div>

              <button id="register-submit" type="submit" disabled={loading}
                className="btn-wc w-full flex items-center justify-center gap-2 py-3.5 mt-2 min-h-[48px]">
                {loading
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <UserPlus size={17} />}
                {loading ? 'Creating account...' : 'Register Free'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-xs text-zinc-500">or</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            <p className="text-center text-sm text-zinc-400">
              Already have an account?{' '}
              <Link href="/login" className="font-bold hover:opacity-80 transition-opacity"
                style={{ color: 'var(--wc-red)' }}>Sign in</Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6 text-zinc-500 text-[10px] font-black tracking-widest uppercase">
          <span>USA</span><span>·</span><span>Canada</span><span>·</span><span>Mexico</span>
        </div>
      </motion.div>
    </div>
  );
}
