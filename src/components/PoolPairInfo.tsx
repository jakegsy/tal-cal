import { useTokenInfo } from '../hooks/useTokenData';
import { useUniswapV3Pool } from '../hooks/useUniswapV3Pool';
import { useEffect } from 'react';

interface PoolPairInfoProps {
  poolAddress: string;
  onPairInfoChange?: (pairInfo: string) => void;
  onDebugInfo?: (info: string) => void;
}

function formatFeePercent(feeTier: string): string {
  return `${(Number(feeTier) / 10000).toFixed(3)}%`;
}

export function PoolPairInfo({ poolAddress, onPairInfoChange, onDebugInfo }: PoolPairInfoProps) {
  const { poolInfo, loading: poolLoading } = useUniswapV3Pool(poolAddress);
  const { data: token0Info, isLoading: token0Loading } = useTokenInfo(poolInfo?.token0?.id);
  const { data: token1Info, isLoading: token1Loading } = useTokenInfo(poolInfo?.token1?.id);
  const isLoading = poolLoading || token0Loading || token1Loading;

  useEffect(() => {
    if (!isLoading && poolInfo && token0Info && token1Info && onPairInfoChange) {
      const formattedPairInfo = `${token0Info.symbol}/${token1Info.symbol} ${formatFeePercent(poolInfo.feeTier)}`;
      console.log('PoolPairInfo sending:', formattedPairInfo);
      onPairInfoChange(formattedPairInfo);
      if (onDebugInfo) {
        onDebugInfo(`Pool Info: ${JSON.stringify(poolInfo)} Token 0 Info: ${JSON.stringify(token0Info)} Token 1 Info: ${JSON.stringify(token1Info)}`);
      }
    }
  }, [isLoading, poolInfo, token0Info, token1Info, onPairInfoChange, onDebugInfo]);

  if (isLoading || !poolInfo || !token0Info || !token1Info) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1">
          <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse" />
          <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse" />
        </div>
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-1">
        <img
          src={token0Info.icon}
          alt={token0Info.symbol}
          className="w-5 h-5 rounded-full bg-white"
          style={{
            border: '2px solid white',
          }}
        />
        <img
          src={token1Info.icon}
          alt={token1Info.symbol}
          className="w-5 h-5 rounded-full bg-white"
          style={{
            border: '2px solid white',
          }}
        />
      </div>
      <span className="text-sm text-gray-900">
        {token0Info.symbol}/{token1Info.symbol} {formatFeePercent(poolInfo.feeTier)}
      </span>
    </div>
  );
}