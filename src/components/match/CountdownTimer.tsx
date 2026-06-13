'use client';
import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  kickoffTime: string;
}

export default function CountdownTimer({ kickoffTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    isPast: boolean;
  }>({ hours: '00', minutes: '00', seconds: '00', isPast: true });

  useEffect(() => {
    const target = new Date(kickoffTime).getTime();

    const calculate = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00', isPast: true });
        return;
      }

      const totalSecs = Math.floor(diff / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;

      const format = (n: number) => String(n).padStart(2, '0');

      setTimeLeft({
        hours: format(hours),
        minutes: format(minutes),
        seconds: format(seconds),
        isPast: false,
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);

    return () => clearInterval(interval);
  }, [kickoffTime]);

  if (timeLeft.isPast) {
    return <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Predictions Closed</span>;
  }

  return (
    <div className="flex flex-col items-end gap-0.5 select-none text-right shrink-0">
      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wide">Locks in</span>
      <div className="flex items-center gap-1 font-mono text-xs font-black text-white">
        <span>{timeLeft.hours}</span>
        <span className="text-zinc-500 text-[9px] font-normal font-sans">hrs</span>
        <span className="text-zinc-700">:</span>
        <span>{timeLeft.minutes}</span>
        <span className="text-zinc-500 text-[9px] font-normal font-sans">min</span>
        <span className="text-zinc-700">:</span>
        <span>{timeLeft.seconds}</span>
        <span className="text-zinc-500 text-[9px] font-normal font-sans">sec</span>
      </div>
    </div>
  );
}
