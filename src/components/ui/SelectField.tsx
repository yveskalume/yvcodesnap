import React from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

export type SelectOption = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
};

interface SelectFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  triggerClassName?: string;
}

const baseTrigger =
  'w-full inline-flex items-center justify-between gap-2 bg-white/5 text-white px-3 py-2 rounded-lg text-sm border border-white/5 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition';

const SelectField: React.FC<SelectFieldProps> = ({
  value,
  onValueChange,
  options,
  placeholder,
  triggerClassName = '',
}) => {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        className={`${baseTrigger} ${triggerClassName}`}
        aria-label={placeholder}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <ChevronDown className="w-4 h-4 text-neutral-400" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="overflow-hidden rounded-lg border border-white/10 bg-[#0f1117] shadow-xl shadow-black/40 z-50"
          position="popper"
          sideOffset={6}
        >
          <Select.ScrollUpButton className="flex items-center justify-center py-1 text-neutral-400">
            <ChevronUp className="w-4 h-4" />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-1">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="text-sm text-neutral-200 rounded-md px-3 py-2 cursor-pointer select-none flex items-center justify-between gap-3 hover:bg-white/5 data-[state=checked]:bg-blue-600/20 data-[state=checked]:text-blue-200 focus:outline-none data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed"
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check className="w-4 h-4 text-blue-400" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex items-center justify-center py-1 text-neutral-400">
            <ChevronDown className="w-4 h-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default SelectField;
