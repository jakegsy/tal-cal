import { PoolData } from "../services/uniswapV3";

const Q96 = Math.pow(2, 96);
const PERCENTAGE_BASE = 100;


export function calculateLiquidity(
    totalLiquidity: bigint,
    startSqrtPriceX96: number,
    endSqrtPriceX96: number,
    isToken0Base: boolean
): number {
    const diffSqrtPriceX96 = Math.abs(startSqrtPriceX96 - endSqrtPriceX96);
    console.log("diffSqrtPriceX96 %s startSqrtPriceX96 %s endSqrtPriceX96 %s", diffSqrtPriceX96, startSqrtPriceX96, endSqrtPriceX96);
    const liquidityValue = isToken0Base
        ? Number(totalLiquidity) * diffSqrtPriceX96 / Q96
        : Number(totalLiquidity) * diffSqrtPriceX96 * Q96 / startSqrtPriceX96 / endSqrtPriceX96;
    
    return liquidityValue;
} 

export interface PriceCalculationResult {
    priceBase: number;
    targetPrice: number;
    startSqrtPriceX96: number;
    endSqrtPriceX96: number;
}
export interface TickCalculationResult {
    startTick: number;
    endTick: number;
}

export function calculateTicks(
    startSqrtPriceX96: number,
    endSqrtPriceX96: number, 
    tickSpacing: number
): TickCalculationResult {
    // Convert sqrtPrice to tick index using log base sqrt(1.0001)
    const logBase = Math.log(1.0001) / 2;
    
    // Calculate raw ticks
    const startTick = Math.floor(Math.log(startSqrtPriceX96 / Q96) / logBase);
    const endTick = Math.ceil(Math.log(endSqrtPriceX96 / Q96) / logBase);
    
    // Round to nearest valid tick based on spacing
    const startTickRounded = Math.round(startTick / tickSpacing) * tickSpacing;
    const endTickRounded = Math.round(endTick / tickSpacing) * tickSpacing;
    return {
        startTick: startTickRounded,
        endTick: endTickRounded
    };
}

export function calculatePrices(
    sqrtPriceX96: number,
    decimalScale: number,
    isToken0Base: boolean,
    priceRange: number
): PriceCalculationResult {
    const startSqrtPriceX96 = sqrtPriceX96;
    const startPriceX96 = startSqrtPriceX96 * startSqrtPriceX96;
    
    const priceScale1per0 = startPriceX96 / Q96 / Q96;

    const priceNorm1per0 = priceScale1per0 * decimalScale;
    const priceNorm0per1 = 1 / priceNorm1per0;
    const priceBase = 1 / priceNorm0per1;
    const targetPrice = isToken0Base
        ? priceBase * (PERCENTAGE_BASE + priceRange) / PERCENTAGE_BASE
        : priceBase * (PERCENTAGE_BASE - priceRange) / PERCENTAGE_BASE;
    
    console.log((PERCENTAGE_BASE + priceRange) / PERCENTAGE_BASE);
    console.log((PERCENTAGE_BASE - priceRange) / PERCENTAGE_BASE);
    
        const endSqrtPriceX96 = Math.sqrt(targetPrice * (Q96 * Q96) / decimalScale);
    
    return {
        priceBase,
        targetPrice,
        startSqrtPriceX96,
        endSqrtPriceX96
    };
} 