import { useEffect, useState } from 'react';
import { calculateLiquidity, calculatePrices, calculateTicks } from '../utils/uniswapV3';
import { graphService, sumLiquidityNet, usePoolData, useTicksData } from '../services/thegraph';
import { TICK_SPACINGS } from '@uniswap/v3-sdk';
import { useTokenPrice } from './useTokenData';

interface UseUniswapV3LiquidityResult {
  liquidity: number | null;
  liquidityUSD: number | null;
  loading: boolean;
  error: Error | null;
}

export function useUniswapV3Liquidity(
    poolAddress: string,
    baseToken: string,
    priceRange: number,
): UseUniswapV3LiquidityResult {
    const [liquidity, setLiquidity] = useState<number | null>(null);
    const [liquidityUSD, setLiquidityUSD] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const poolQuery = usePoolData(poolAddress);
    const poolData = poolQuery.data;

    // Get token prices using useTokenPrice hook
    const baseTokenPrice = useTokenPrice(baseToken);
    const quoteTokenPrice = useTokenPrice(
        poolData ? (baseToken.toLowerCase() === poolData.token0.id.toLowerCase() 
            ? poolData.token1.id 
            : poolData.token0.id) 
        : undefined
    );
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);
        async function fetchLiquidity() {
            if (!poolAddress || !baseToken || !poolData) {
                if (mounted) setLoading(false);
                return;
            }
            try {
                const isBaseTokenValid = [poolData.token0.id, poolData.token1.id]
                    .map(t => t.toLowerCase())
                    .includes(baseToken.toLowerCase());
                if (!isBaseTokenValid) {
                    throw new Error("Base token must be one of the pool tokens");
                }

                const isToken0Base = baseToken.toLowerCase() === poolData.token0.id.toLowerCase();
                const quoteToken = isToken0Base ? poolData.token1.id : poolData.token0.id;

                const sqrtPriceX96 = Number(poolData.sqrtPrice);
                const currentTick = Number(poolData.tick);  
                const feeTier = parseInt(poolData.feeTier) as 100 | 200 | 300 | 400 | 500 | 3000 | 10000;
                const tickSpacing = TICK_SPACINGS[feeTier];

                const prices = calculatePrices(sqrtPriceX96, isToken0Base, priceRange);
                
                // Debug price calculations
                console.log('\nDebug Information:');
                console.log('Current sqrtPriceX96:', sqrtPriceX96);
                console.log('Current tick:', currentTick);
                console.log('Start price (ETH/USDC):', prices.startPrice);
                console.log('Target price (ETH/USDC):', prices.targetPrice);
                console.log('Start price (USDC/ETH):', 1 / prices.startPrice);
                console.log('Target price (USDC/ETH):', 1 / prices.targetPrice);
                console.log('Start sqrtPriceX96:', prices.startSqrtPriceX96);
                console.log('End sqrtPriceX96:', prices.endSqrtPriceX96);
                
                const ticks = calculateTicks(
                    prices.startSqrtPriceX96, 
                    prices.endSqrtPriceX96, 
                    tickSpacing
                );
                
                // Debug tick calculations
                console.log('Calculated start tick:', ticks.startTick);
                console.log('Calculated end tick:', ticks.endTick);
                
                const ticksData = await graphService.getTicks(
                    poolAddress, 
                    ticks.startTick, 
                    ticks.endTick
                );

                if (!ticksData) {
                    throw new Error(`Ticks data not found for ${poolAddress}`);
                }

                // Debug liquidity analysis
                console.log('\nLiquidity Analysis:');
                console.log('Current Tick:', ticks.startTick);
                console.log('Target Tick:', ticks.endTick);

                let activeLiquidity = BigInt(poolData.liquidity);
                const netLiquidity = sumLiquidityNet(ticksData);
                console.log('Net Liquidity:', netLiquidity.toString());
                activeLiquidity = isToken0Base ? activeLiquidity - netLiquidity : activeLiquidity + netLiquidity;
                
                const tokenAmountRaw = calculateLiquidity(
                    activeLiquidity,
                    prices.startSqrtPriceX96,
                    prices.endSqrtPriceX96,
                    isToken0Base
                ); 

                // Debug token amounts
                const token0Decimals = Number(poolData.token0.decimals);
                const token1Decimals = Number(poolData.token1.decimals);
                const adjustedAmount = tokenAmountRaw / 10**(!isToken0Base ? token0Decimals : token1Decimals);
                console.log('\nToken Amounts in Range:');
                console.log(`${isToken0Base ? poolData.token1.symbol : poolData.token0.symbol} Amount:`, adjustedAmount.toFixed(8));

                const tokenAmountClean = isToken0Base ? 
                    tokenAmountRaw / 10**Number(poolData.token1.decimals):
                    tokenAmountRaw / 10**Number(poolData.token0.decimals);
                console.log("tokenAmountClean", tokenAmountClean);
                // Calculate USD value using fetched token prices
                const finalLiquidityUSD = tokenAmountClean * quoteTokenPrice.data

                if (mounted) {
                    setLiquidity(tokenAmountClean);
                    setLiquidityUSD(finalLiquidityUSD);
                    setError(null);
                }
            } catch (err) {
                console.error('Error fetching UniswapV3 liquidity:', err);
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch liquidity'));
                    setLiquidity(null);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchLiquidity();
        return () => { mounted = false; };
    }, [poolAddress, baseToken, priceRange, poolData, baseTokenPrice.data, quoteTokenPrice.data]);

    // Consider all loading states
    const isLoading = loading || poolQuery.isLoading || baseTokenPrice.isLoading || quoteTokenPrice.isLoading;
    
    return { 
        liquidity, 
        liquidityUSD, 
        loading: isLoading, 
        error: error || poolQuery.error || baseTokenPrice.error || quoteTokenPrice.error || null 
    };
}
