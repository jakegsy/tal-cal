import { Circle } from 'lucide-react';
import { NATIVE_QUOTE_TOKENS } from '../constants/tokens';

interface NativeLiquidityTokensProps {
  onSelect?: (address: string) => void;
}

export function NativeLiquidityTokens({ onSelect }: NativeLiquidityTokensProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {NATIVE_QUOTE_TOKENS.map((token) => (
          <button
            key={token.address}
            onClick={() => onSelect?.(token.address)}
            className="relative rounded-full bg-white border border-gray-200 p-1 hover:z-10 transition-transform hover:scale-110"
          >
            {token.icon ? (
              <img
                src={token.icon}
                alt={token.symbol}
                className="w-5 h-5 rounded-full"
              />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-600">Native Liquidity</span>
    </div>
  );
}