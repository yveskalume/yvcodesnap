import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

type Props = {
  value: number | '' | undefined;
  onChange: (value: number | '') => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
};

const base =
  'w-full h-10 flex items-center bg-[#11121a] border border-white/10 rounded-lg px-3 text-sm text-white focus-within:border-blue-500/70 focus-within:ring-2 focus-within:ring-blue-500/20 transition';

const NumberField: React.FC<Props> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  className = '',
}) => {
  const numeric = typeof value === 'number' ? value : value === '' ? '' : Number(value);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange('');
      return;
    }
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    onChange(n);
  };

  const bump = (delta: number) => {
    const current = typeof numeric === 'number' ? numeric : 0;
    let next = current + delta;
    if (typeof min === 'number') next = Math.max(min, next);
    if (typeof max === 'number') next = Math.min(max, next);
    onChange(Number.isFinite(next) ? Number(next.toFixed(3)) : current);
  };

  return (
    <div className={clsx(base, className)}>
      <input
        type="number"
        value={numeric}
        onChange={handleInput}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-white placeholder:text-neutral-500"
      />
      <div className="ml-2 flex flex-col gap-[2px] text-neutral-400">
        <button
          type="button"
          onClick={() => bump(step)}
          className="w-6 h-4 flex items-center justify-center rounded hover:bg-white/10 active:bg-white/15 transition"
          aria-label="Increase"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => bump(-step)}
          className="w-6 h-4 flex items-center justify-center rounded hover:bg-white/10 active:bg-white/15 transition"
          aria-label="Decrease"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default NumberField;
