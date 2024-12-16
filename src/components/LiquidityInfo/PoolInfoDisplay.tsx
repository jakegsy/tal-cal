import { useMemo } from 'react';
import { useTokenBalance, useTokenPrice } from '../../hooks/useTokenData';
import { useUniswapV3Pool } from '../../hooks/useUniswapV3Pool';
import { formatCurrency } from '../../utils/format';
import { ExternalLink } from 'lucide-react';

function useTokenData(tokenId: string | undefined, poolAddress: string) {
  const { data: balance } = useTokenBalance(tokenId || '', poolAddress);
  const { data: price } = useTokenPrice(tokenId || '');
  return { balance, price };
}

interface PoolInfoDisplayProps {
  poolAddress: string;
}

export function PoolInfoDisplay({ poolAddress }: PoolInfoDisplayProps) {
  const { poolInfo, loading: poolLoading, error: poolError } = useUniswapV3Pool(poolAddress);
  const token0Data = useTokenData(poolInfo?.token0?.id, poolAddress);
  const token1Data = useTokenData(poolInfo?.token1?.id, poolAddress);
  
  // Early return for loading and error states
  if (poolLoading) {
    return (
      <div className="mt-6 bg-gray-50 rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (poolError || !poolInfo) {
    return (
      <div className="mt-6 bg-red-50 text-red-600 rounded-lg p-6">
        {poolError?.message || 'Failed to load pool information'}
      </div>
    );
  }

  const poolName = `Uniswap V3 ${poolInfo.token0.symbol}-${poolInfo.token1.symbol} ${(Number(poolInfo.feeTier) / 10000).toFixed(2)}%`;
  const token0Amt = Number(token0Data.balance || 0)/ 10**Number(poolInfo.token0.decimals);
  const token1Amt = Number(token1Data.balance || 0)/ 10**Number(poolInfo.token1.decimals);
  const TVLinUSD = (token0Amt * (token0Data.price || 0)) + (token1Amt * (token1Data.price || 0));

  return (
    <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Pool:</span>
          <span>{poolName}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Pooled Base Token:</span>
          <span>{token0Amt} {poolInfo.token0.symbol}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Pooled Paired Token:</span>
          <span>{token1Amt} {poolInfo.token1.symbol}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">TVL USD:</span>
          <span>{formatCurrency(TVLinUSD)}</span>
        </div>
      </div>
      
      <button 
        className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        onClick={() => window.open(`https://info.uniswap.org/#/pools/${poolAddress}`, '_blank')}
      >
        View Pool
      </button>
    </div>
  );
}