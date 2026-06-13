'use client';
// app/(auth)/group-setup/page.tsx — Create or Join a League
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, LogIn, Copy, Check, ArrowRight, LogOut } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { apiCreateGroup, apiJoinGroup, apiGetMe, apiLogout } from '@/lib/api/client';
import { useAppStore } from '@/lib/store/useAppStore';

export default function GroupSetupPage() {
  const [groupName, setGroupName]   = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading]       = useState<'create' | 'join' | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied]         = useState(false);
  const { setUser, user } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    const syncProfile = async () => {
      try {
        const freshUser = await apiGetMe();
        setUser(freshUser);
        if (freshUser.groupId) {
          router.replace('/dashboard');
        }
      } catch {
        setUser(null);
        router.replace('/login');
      }
    };
    syncProfile();
  }, [setUser, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('create');
    try {
      const group = await apiCreateGroup(groupName.trim());
      setCreatedCode(group.inviteCode);
      if (user) setUser({ ...user, groupId: group.id, groupName: group.name, inviteCode: group.inviteCode });
      toast.success(`League "${group.name}" created!`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not create league. Try again.';
      toast.error(msg);
    } finally { setLoading(null); }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('join');
    try {
      const result = await apiJoinGroup(inviteCode.trim().toUpperCase());
      if (user) setUser({ ...user, groupId: result.groupId, groupName: result.groupName, inviteCode: result.inviteCode });
      toast.success(`Joined "${result.groupName}"! Good luck 🏆`);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid invite code. Check and try again.';
      toast.error(msg);
    } finally { setLoading(null); }
  };

  const copyCode = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as any } },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-pattern">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center justify-center mb-4">
          <Image
            src="/wc2026-logo.svg"
            alt="FIFA World Cup 2026"
            width={80}
            height={110}
            className="drop-shadow-[0_0_24px_rgba(245,158,11,0.5)]"
            priority
          />
        </div>
        <h1 className="text-3xl font-black">Join the Competition</h1>
        <p className="text-zinc-400 mt-2 text-sm">Create a private league or join one with an invite code</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {/* ── Create a League ── */}
        <motion.div variants={cardVariants} className="glass rounded-2xl p-6 border border-amber-500/15 shadow-gold-glow">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Plus className="text-amber-400" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-white">Create a League</h2>
              <p className="text-xs text-zinc-400">Get a 6-char invite code</p>
            </div>
          </div>

          {createdCode ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p className="text-sm text-zinc-300">Share this code with friends:</p>
              <div className="flex items-center justify-between bg-zinc-900 border border-amber-500/30 rounded-xl px-4 py-3">
                <span className="text-2xl font-black tracking-[0.25em] text-amber-400">{createdCode}</span>
                <button onClick={copyCode} className="text-zinc-400 hover:text-white transition-colors p-1.5">
                  {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                </button>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold py-3 rounded-xl shadow-gold-glow hover:shadow-gold-glow-lg transition-all"
              >
                Go to Dashboard <ArrowRight size={16} />
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                id="create-group-name"
                type="text"
                placeholder="e.g. Office WC League"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              <button
                id="create-group-submit"
                type="submit"
                disabled={loading === 'create'}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-60 text-black font-bold py-3 rounded-xl shadow-gold-glow transition-all"
              >
                {loading === 'create' ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Plus size={16} />}
                {loading === 'create' ? 'Creating...' : 'Create League'}
              </button>
            </form>
          )}
        </motion.div>

        {/* ── Join a League ── */}
        <motion.div variants={cardVariants} className="glass rounded-2xl p-6 border border-blue-500/15 shadow-blue-glow">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <LogIn className="text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-white">Join a League</h2>
              <p className="text-xs text-zinc-400">Enter a 6-character code</p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-3">
            <input
              id="join-invite-code"
              type="text"
              placeholder="e.g. WC2026"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              maxLength={6}
              required
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-center text-xl font-black tracking-[0.3em] uppercase focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <button
              id="join-group-submit"
              type="submit"
              disabled={loading === 'join'}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-blue-glow"
            >
              {loading === 'join' ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn size={16} />}
              {loading === 'join' ? 'Joining...' : 'Join League'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-zinc-500">Ask a friend for their invite code</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex flex-col items-center gap-2"
      >
        <p className="text-xs text-zinc-500">You can only be in one league at a time</p>
        <button
          onClick={async () => {
            try {
              await apiLogout();
              setUser(null);
              router.push('/login');
              toast.success('Signed out successfully 👋');
            } catch {
              toast.error('Logout failed');
            }
          }}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mt-1"
        >
          <LogOut size={12} /> Sign out
        </button>
      </motion.div>
    </div>
  );
}
