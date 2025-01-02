import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface LiquidityTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const liquidityTypes = [
  { id: 'uniswap_v3', name: 'Uniswap V3 AMM' },
  { id: 'native', name: 'Native' },
];

export function LiquidityTypeSelect({ value, onChange }: LiquidityTypeSelectProps) {

  const [open, isOpen] = useState(false)
  
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white rounded-lg border border-gray-200 px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {liquidityTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
    </div>
  );
}