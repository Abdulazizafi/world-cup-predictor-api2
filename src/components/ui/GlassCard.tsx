'use client';
// components/ui/GlassCard.tsx — Reusable glassmorphism card
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'gold' | 'blue' | 'none';
  animate?: boolean;
  delay?: number;
}

export default function GlassCard({
  children,
  className,
  hover = false,
  glow = 'none',
  animate = true,
  delay = 0,
}: GlassCardProps) {
  const glowClass = {
    gold: 'shadow-gold-glow border-amber-500/20',
    blue: 'shadow-blue-glow border-blue-500/20',
    none: 'border-white/8',
  }[glow];

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 16 } : false}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      className={cn(
        'glass rounded-2xl',
        glowClass,
        hover && 'transition-shadow duration-300 cursor-pointer',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
