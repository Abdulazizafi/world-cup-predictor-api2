'use client';
import { Minus, Plus } from 'lucide-react';

interface StepperInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export default function StepperInput({
  value,
  onChange,
  disabled = false,
  min = 0,
  max = 30,
}: StepperInputProps) {
  const handleDecrement = () => {
    if (disabled) return;
    const current = parseInt(value, 10);
    if (isNaN(current)) {
      onChange(String(min));
    } else if (current > min) {
      onChange(String(current - 1));
    }
  };

  const handleIncrement = () => {
    if (disabled) return;
    const current = parseInt(value, 10);
    if (isNaN(current)) {
      onChange(String(min));
    } else if (current < max) {
      onChange(String(current + 1));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange('');
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(String(num));
    }
  };

  return (
    <div className="flex items-center bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-inner w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={handleDecrement}
        className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
      >
        <Minus size={14} />
      </button>
      
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        placeholder="0"
        className="flex-1 w-full bg-transparent border-none text-center text-lg font-black text-white focus:outline-none focus:ring-0 p-0"
      />

      <button
        type="button"
        disabled={disabled}
        onClick={handleIncrement}
        className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
