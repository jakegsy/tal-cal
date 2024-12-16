interface PriceRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ranges = ['0.1%', '0.5%', '1%', '5%', '10%'];

export function PriceRangeSelector({ value, onChange }: PriceRangeSelectorProps) {
  return (
    <div className="inline-flex rounded-xl bg-gray-50 p-1">
      {ranges.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`
            px-6 py-2 text-sm font-medium rounded-lg transition-all
            ${value === range
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          {range}
        </button>
      ))}
    </div>
  );
}