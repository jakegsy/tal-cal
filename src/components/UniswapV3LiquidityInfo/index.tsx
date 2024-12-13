import { useUniswapV3Pool } from '../../hooks/useUniswapV3Pool';
import { useUniswapV3Liquidity } from '../../hooks/useUniswapV3Liquidity';
import { parsePriceRangePercent } from '../../utils/orderbook';

// New wrapper component to handle the conditional logic
export function UniswapV3LiquidityDisplay({ 
    poolAddress, 
    baseToken, 
    priceRange 
}: { 
    poolAddress: string | null; 
    baseToken: string; 
    priceRange: string 
}) {
    if (!poolAddress) {
        return <EmptyUniswapV3Info />;
    }
    return <SingleUniswapV3Info poolAddress={poolAddress} baseToken={baseToken} priceRange={priceRange} />;
}

export function SingleUniswapV3Info({ 
    poolAddress, 
    baseToken, 
    priceRange 
}: { 
    poolAddress: string; 
    baseToken: string; 
    priceRange: string 
}) {
    const { 
        liquidityUSD: poolLiquidity, 
        loading: liquidityLoading, 
        error: liquidityError 
    } = useUniswapV3Liquidity(
        poolAddress, 
        baseToken,
        parsePriceRangePercent(priceRange)
    );
    
    const loading = liquidityLoading;

    if (loading) {
        return (
            <div>
                <span className="text-gray-500">
                    Loading...
                </span>
            </div>
        );
    }

    if (liquidityError) {
        return <span className="text-red-500">{liquidityError.message}</span>;
    }

    if (poolLiquidity === null) {
        return <span className="text-gray-500">No liquidity data available</span>;
    }

    return (
        <span className="inline-block">
            ${poolLiquidity.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            })}
        </span>
    );
}

export function EmptyUniswapV3Info() {
    return (
        <span className="inline-block text-gray-500">
            Select a pool to view liquidity
        </span>
    );
}
