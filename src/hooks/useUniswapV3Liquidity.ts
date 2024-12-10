import { useEffect, useState } from 'react';
import { uniswapV3Service } from '../services/uniswapV3';
import { calculateLiquidity, calculatePrices } from '../utils/uniswapV3';
import { CoinGeckoService } from '../services/coingecko';

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

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);

        async function fetchLiquidity() {
            if (!poolAddress) {
                if (mounted) setLoading(false);
                return;
            }

            try {
                const poolData = await uniswapV3Service.getPoolData(poolAddress);
                const isBaseTokenValid = [poolData.token0, poolData.token1]
                    .map(t => t.toLowerCase())
                    .includes(baseToken.toLowerCase());
                
                if (!isBaseTokenValid) {
                    throw new Error("Base token must be one of the pool tokens");
                }

                const isToken0Base = baseToken.toLowerCase() === poolData.token0.toLowerCase();
                
                const decimalScale = 10**Number(poolData.token1Decimals - poolData.token0Decimals);
                const prices = calculatePrices(
                    Number(poolData.sqrtPriceX96),
                    decimalScale,
                    isToken0Base,
                    priceRange
                );
                console.log(prices);
                
                const scaleLiquidity = calculateLiquidity(
                    poolData.liquidity,
                    prices.startSqrtPriceX96,
                    prices.endSqrtPriceX96,
                    isToken0Base
                );
                
                const finalLiquidity = isToken0Base ? 
                    scaleLiquidity / 10**Number(poolData.token1Decimals):
                    scaleLiquidity / 10**Number(poolData.token0Decimals);
                
                const coinGeckoService = new CoinGeckoService();
                const backToken = isToken0Base ? poolData.token1 : poolData.token0;
                const baseTokenPrice = await coinGeckoService.getTokenPrice(backToken);
                const finalLiquidityUSD = finalLiquidity * baseTokenPrice;
                console.log(baseTokenPrice);
                console.log(finalLiquidityUSD);
                if (mounted) {
                    setLiquidity(finalLiquidity);
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
    }, [poolAddress, baseToken, priceRange]);

    return { liquidity, liquidityUSD, loading, error };
}


