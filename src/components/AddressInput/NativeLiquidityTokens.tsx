import { Circle } from 'lucide-react';
import { NATIVE_QUOTE_TOKENS } from '../../constants/tokens';

interface NativeLiquidityTokensProps {
  onSelect?: (address: string) => void;
}

export function NativeLiquidityTokens({ onSelect }: NativeLiquidityTokensProps) {
  return (
    <div className="flex items-center gap-1 md:gap-2">
      <div className="flex -space-x-1.5 md:-space-x-2">
        {NATIVE_QUOTE_TOKENS.map((token) => (
          <button
            key={token.address}
            onClick={() => onSelect?.(token.address)}
            className="relative rounded-full bg-white border border-gray-200 p-0.5 md:p-1 hover:z-10 transition-transform hover:scale-110"
          >
            {token.icon ? (
              <img
                src={token.icon}
                alt={token.symbol}
                className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full"
              />
            ) : (
              <Circle className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-gray-400" />
            )}
          </button>
        ))}
      </div>
      <span className="text-xs md:text-sm text-gray-600">Native Liquidity</span>
    </div>
  );
}