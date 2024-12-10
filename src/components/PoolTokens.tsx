import { Circle } from 'lucide-react';
import { Token } from '../types';

interface PoolTokensProps {
  tokens: Token[];
  label?: string;
}

export function PoolTokens({ tokens, label }: PoolTokensProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {tokens.map((token, index) => (
          <div key={index} className="relative rounded-full bg-white border border-gray-200">
            {token.icon ? (
              <img
                src={token.icon}
                alt={token.symbol}
                className="w-5 h-5 rounded-full"
              />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
          </div>
        ))}
      </div>
      {label && <span className="text-sm text-gray-600">{label}</span>}
    </div>
  );
}