import { useUniswapV3Pool } from '../../hooks/useUniswapV3Pool';
import { useUniswapV3PoolData } from '../../hooks/useUniswapV3PoolData';
import { useTokenInfo } from '../../hooks/useTokenInfo';
import { formatCurrency } from '../../utils/format';
import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ethereumService } from '../../services/ethereum';
import { coinGeckoService } from '../../services/coingecko';

interface PoolInfoDisplayProps {
  poolAddress: string;
}

export function PoolInfoDisplay({ poolAddress }: PoolInfoDisplayProps) {
  const { poolInfo, loading: poolLoading } = useUniswapV3Pool(poolAddress);
  const { poolData, loading: dataLoading } = useUniswapV3PoolData(poolAddress);
  const { tokenInfo: token0Info } = useTokenInfo(poolInfo?.token0);
  const { tokenInfo: token1Info } = useTokenInfo(poolInfo?.token1);
  const [token0Balance, setToken0Balance] = useState<bigint | null>(null);
  const [token1Balance, setToken1Balance] = useState<bigint | null>(null);
  const [token0Price, setToken0Price] = useState<number | null>(null);
  const [token1Price, setToken1Price] = useState<number | null>(null);

  useEffect(() => {
    async function fetchBalances() {
      if (!poolInfo?.token0 || !poolInfo?.token1 || !poolAddress) return;
      
      try {
        const [balance0, balance1] = await Promise.all([
          ethereumService.getTokenBalance(poolInfo.token0, poolAddress),
          ethereumService.getTokenBalance(poolInfo.token1, poolAddress)
        ]);
        setToken0Balance(balance0);
        setToken1Balance(balance1);
      } catch (error) {
        console.error('Error fetching token balances:', error);
      }
    }

    fetchBalances();
  }, [poolAddress, poolInfo?.token0, poolInfo?.token1]);

  useEffect(() => {
    async function fetchPrices() {
      if (!poolInfo?.token0 || !poolInfo?.token1) return;
      
      try {
        const [price0, price1] = await Promise.all([
          coinGeckoService.getTokenPrice(poolInfo.token0),
          coinGeckoService.getTokenPrice(poolInfo.token1)
        ]);
        setToken0Price(price0);
        setToken1Price(price1);
      } catch (error) {
        console.error('Error fetching token prices:', error);
      }
    }

    fetchPrices();
  }, [poolInfo?.token0, poolInfo?.token1]);

  if (poolLoading || dataLoading || !poolInfo || !poolData || !token0Info || !token1Info || 
      token0Balance === null || token1Balance === null || token0Price === null || token1Price === null) {
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

  const poolName = `Uniswap V3 ${token0Info.symbol}-${token1Info.symbol} ${(Number(poolInfo.fee) / 10000).toFixed(3)}%`;
  
  // Convert token balances to display format
  const token0Amount = Number(token0Balance) / Math.pow(10, Number(token0Info.decimals));
  const token1Amount = Number(token1Balance) / Math.pow(10, Number(token1Info.decimals));
  
  // Calculate TVL using CoinGecko prices
  const tvlUsd = (token0Amount * token0Price) + (token1Amount * token1Price);

  const handleViewPool = () => {
    window.open(`https://app.uniswap.org/explore/pools/ethereum/${poolAddress}`, '_blank');
  };

  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-6">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-gray-600">Pool:</div>
        <div className="text-right font-medium">{poolName}</div>
        
        <div className="text-gray-600">Pooled Base Token:</div>
        <div className="text-right">
          {token0Amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {token0Info.symbol}
        </div>
        
        <div className="text-gray-600">Pooled Paired Token:</div>
        <div className="text-right">
          {token1Amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {token1Info.symbol}
        </div>
        
        <div className="text-gray-600">TVL USD:</div>
        <div className="text-right">{formatCurrency(tvlUsd)}</div>
      </div>
      
      <button 
        className="mt-4 px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        onClick={handleViewPool}
      >
        View Pool
        <ExternalLink className="w-4 h-4" />
      </button>
    </div>
  );
}