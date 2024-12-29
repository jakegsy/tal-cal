import { UniswapV3LiquidityDisplay } from '../LiquidityInfo/UniswapV3LiquidityInfo';
import { SingleVaultInfo, TotalVaultInfo } from '../LiquidityInfo/NativeVaultLiquidityInfo';
import { PoolInfoDisplay } from './PoolInfoDisplay';
import { useEffect } from 'react';

interface TotalLiquidityDisplayProps {
  liquidityType: string;
  poolAddress: string;
  baseToken: string;
  pairToken: string;
  priceRange: number;
  onLiquidityCalculated?: (value: string) => void;
}

export function TotalLiquidityDisplay({ 
  liquidityType, 
  poolAddress, 
  baseToken, 
  pairToken, 
  priceRange,
  onLiquidityCalculated 
}: TotalLiquidityDisplayProps) {
  const renderLiquidityValue = () => {
    if (liquidityType === 'uniswap_v3') {
      return <UniswapV3LiquidityDisplay 
        poolAddress={poolAddress || null}
        baseToken={baseToken}
        priceRange={priceRange}
        onValueCalculated={onLiquidityCalculated}
      />;
    }
    if (pairToken) {
      return <SingleVaultInfo 
        pairToken={pairToken} 
        priceRange={priceRange}
        onValueCalculated={onLiquidityCalculated}
      />;
    }
    return <TotalVaultInfo 
      priceRange={priceRange}
      onValueCalculated={onLiquidityCalculated}
    />;
  };


  const renderAdditionalInfo = () => {
    console.log('look here:', liquidityType, poolAddress)

    if (liquidityType === 'uniswap_v3' && poolAddress) {
      return <PoolInfoDisplay poolAddress={poolAddress} />;
    }
    if (liquidityType !== 'uniswap_v3' && pairToken) {
      return (
        <div className="flex gap-2">
          <button 
            onClick={() => window.open(`https://app.uniswap.org/explore/pools/ethereum/${pairToken}`, '_blank')}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            View Pool
          </button>
          <button 
            onClick={() => window.open(`https://app.uniswap.org/add/${pairToken}`, '_blank')}
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600"
          >
            Add Liquidity
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold inline-flex items-baseline gap-2">
        <span>Total Available Liquidity:</span>
        <span>{renderLiquidityValue()}</span>
      </h2>
      
      {renderAdditionalInfo()}
     
    </div>
    
  );
}