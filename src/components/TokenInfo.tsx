import { Circle } from 'lucide-react';
import { useTokenInfo } from '../hooks/useTokenData';

interface TokenInfoProps {
  address?: string;
}

export function TokenInfo({ address }: TokenInfoProps) {
  const { data: tokenInfo, isLoading, isError } = useTokenInfo(address);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Circle className="w-5 h-5 animate-pulse text-gray-400" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (isError || !tokenInfo) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Circle className="w-5 h-5 text-gray-400" />
      <span className="text-sm">
        <span className="font-medium">{tokenInfo.symbol}</span>
        {tokenInfo.name && (
          <span className="text-gray-500 ml-1">- {tokenInfo.name}</span>
        )}
      </span>
    </div>
  );
}