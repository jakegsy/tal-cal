import { UniswapV3LiquidityDisplay } from '../UniswapV3LiquidityInfo';
import { SingleVaultInfo, TotalVaultInfo } from '../VaultLiquidityInfo';

interface TotalLiquidityDisplayProps {
  liquidityType: string;
  poolAddress: string;
  baseToken: string;
  pairToken: string;
  priceRange: number;
}

export function TotalLiquidityDisplay({ 
  liquidityType, 
  poolAddress, 
  baseToken, 
  pairToken, 
  priceRange 
}: TotalLiquidityDisplayProps) {
  return (
    <h2 className="text-2xl font-bold mb-4">
      Total Available Liquidity: {
        liquidityType === 'uniswap_v3'
          ? <UniswapV3LiquidityDisplay 
              poolAddress={poolAddress || null}
              baseToken={baseToken}
              priceRange={priceRange} 
            />
          : pairToken 
            ? <SingleVaultInfo pairToken={pairToken} priceRange={priceRange} />
            : <TotalVaultInfo priceRange={priceRange} />
      }
    </h2>
  );
} 