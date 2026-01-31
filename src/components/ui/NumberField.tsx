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

  const handleInput = (e: { target: { value: string } }) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange('');
      return;
    }
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    onChange(n);
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
        className="flex-1 bg-transparent text-xs outline-none text-white placeholder:text-neutral-500"
      />
    </div>
  );
};

export default NumberField;
