import { UniswapV3LiquidityDisplay } from '../LiquidityInfo/UniswapV3LiquidityInfo';
import { SingleVaultInfo, TotalVaultInfo } from '../LiquidityInfo/NativeVaultLiquidityInfo';
import { UniV3PoolInfoDisplay } from './UniV3PoolInfoDisplay';
import { NativeVaultPoolInfoDisplay } from './NativeVaultPoolInfoDisplay';
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
    

    if (liquidityType === 'uniswap_v3' && poolAddress) {
      return <UniV3PoolInfoDisplay poolAddress={poolAddress} />;
    }
    if (liquidityType !== 'uniswap_v3' && pairToken) {
      return (
        <NativeVaultPoolInfoDisplay
          baseToken={baseToken} 
          pairToken={pairToken} />
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