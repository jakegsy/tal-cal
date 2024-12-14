import { useUniswapV3Liquidity } from '../../hooks/useUniswapV3Liquidity';
import { parsePriceRangePercent } from '../../utils/orderbook';
import { useEffect } from 'react';

// New wrapper component to handle the conditional logic
export function UniswapV3LiquidityDisplay({ 
    poolAddress, 
    baseToken, 
    priceRange,
    onValueCalculated
}: { 
    poolAddress: string | null; 
    baseToken: string; 
    priceRange: string;
    onValueCalculated?: (value: string) => void;
}) {
    if (!poolAddress) {
        return <EmptyUniswapV3Info />;
    }
    return <SingleUniswapV3Info 
        poolAddress={poolAddress} 
        baseToken={baseToken} 
        priceRange={priceRange}
        onValueCalculated={onValueCalculated}
    />;
}

export function SingleUniswapV3Info({ 
    poolAddress, 
    baseToken, 
    priceRange,
    onValueCalculated
}: { 
    poolAddress: string; 
    baseToken: string; 
    priceRange: string;
    onValueCalculated?: (value: string) => void;
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

    useEffect(() => {
        if (!loading && !liquidityError && poolLiquidity !== null) {
            const formattedValue = poolLiquidity.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            });
            onValueCalculated?.(formattedValue);
        }
    }, [poolLiquidity, loading, liquidityError, onValueCalculated]);

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
