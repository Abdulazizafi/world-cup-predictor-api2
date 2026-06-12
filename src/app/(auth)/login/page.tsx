'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { apiLogin } from '@/lib/api/client';
import { useAppStore } from '@/lib/store/useAppStore';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const setUser = useAppStore(s => s.setUser);
  const router  = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await apiLogin(username.trim(), password);
      setUser(user);
      toast.success(`Welcome back, ${user.username}! ⚽`);
      router.push(user.groupId ? '/dashboard' : '/group-setup');
    } catch {
      setError('Invalid username or password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-wc-pattern wc-arch-bg flex items-center justify-center px-4 py-12">

      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(ellipse, #C1001A 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: '#6B3FA0' }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: '#007A6E' }} />
      </div>

      {/* Animated stripe bar at top */}
      <div className="fixed top-0 left-0 right-0 h-1.5 wc-stripes-bar z-50" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* WC26 Logo */}
        <div className="flex flex-col items-center mb-10">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-4"
          >
            <Image
              src="/wc2026-logo.svg"
              alt="FIFA World Cup 2026"
              width={100}
              height={140}
              className="drop-shadow-[0_0_32px_rgba(193,0,26,0.6)]"
              priority
            />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight">
            WC <span style={{ color: 'var(--wc-red)' }}>Predictor</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1 tracking-wide uppercase font-medium">
            FIFA World Cup 2026™
          </p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl overflow-hidden shadow-card">
          {/* Card top stripe */}
          <div className="h-1 wc-stripes-bar" />
          <div className="p-8">
            <h2 className="text-xl font-bold mb-1">Welcome back</h2>
            <p className="text-zinc-400 text-sm mb-6">Sign in to your league</p>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4 text-sm"
                style={{ background: 'rgba(193,0,26,0.12)', border: '1px solid rgba(193,0,26,0.3)', color: '#ff6b6b' }}
              >
                <AlertCircle size={15} className="shrink-0" />{error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-300">Username</label>
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  placeholder="your_username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  className="input-wc w-full px-4 py-3"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-300">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="input-wc w-full px-4 py-3 pr-12"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1.5">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button id="login-submit" type="submit" disabled={loading}
                className="btn-wc w-full flex items-center justify-center gap-2 py-3.5 mt-2 min-h-[48px]">
                {loading
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <LogIn size={17} />}
                {loading ? 'Signing in...' : 'Enter League'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-xs text-zinc-500">or</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            <p className="text-center text-sm text-zinc-400">
              New here?{' '}
              <Link href="/register"
                className="font-bold transition-colors hover:opacity-80"
                style={{ color: 'var(--wc-red)' }}>
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Host nations */}
        <div className="flex items-center justify-center gap-3 mt-6 text-zinc-500 text-xs">
          <span>🇺🇸 USA</span><span>·</span><span>🇨🇦 Canada</span><span>·</span><span>🇲🇽 Mexico</span>
        </div>
      </motion.div>
    </div>
  );
}
