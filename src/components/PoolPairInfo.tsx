import { useTokenInfo } from '../hooks/useTokenInfo';
import { useUniswapV3Pool } from '../hooks/useUniswapV3Pool';

interface PoolPairInfoProps {
  poolAddress: string;
}

function formatFeePercent(fee: number): string {
  return `${(fee / 10000).toFixed(3)}%`;
}

export function PoolPairInfo({ poolAddress }: PoolPairInfoProps) {
  const { poolInfo, loading: poolLoading, error: poolError } = useUniswapV3Pool(poolAddress);
  const { tokenInfo: token0Info } = useTokenInfo(poolInfo?.token0);
  const { tokenInfo: token1Info } = useTokenInfo(poolInfo?.token1);

  if (poolLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1">
          <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
          <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
        </div>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (poolError || !poolInfo || !token0Info || !token1Info) {
    return (
      <p className="mt-1 text-sm text-red-500">
        {poolError ? 'Invalid Uniswap V3 pool address' : 'Unable to load pool information'}
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-1">
        <img
          src={token0Info.logoURI || `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/${token0Info.symbol.toLowerCase()}.png`}
          alt={token0Info.symbol}
          className="w-6 h-6 rounded-full border border-gray-200 bg-white"
          onError={(e) => {
            e.currentTarget.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'><circle cx='12' cy='12' r='10'/></svg>`;
          }}
        />
        <img
          src={token1Info.logoURI || `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/${token1Info.symbol.toLowerCase()}.png`}
          alt={token1Info.symbol}
          className="w-6 h-6 rounded-full border border-gray-200 bg-white"
          onError={(e) => {
            e.currentTarget.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'><circle cx='12' cy='12' r='10'/></svg>`;
          }}
        />
      </div>
      <span className="text-sm text-gray-600">
        {token0Info.symbol}-{token1Info.symbol} {formatFeePercent(Number(poolInfo.fee))}
      </span>
    </div>
  );
}