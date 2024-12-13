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

export type Tick = {
    tickIdx: number;
    liquidityNet: bigint;
  };

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

    //retrieve start price
    const startPriceX96 = startSqrtPriceX96 * startSqrtPriceX96;
    //unscale it
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


// Define a minimal Tick type

  
  /**
  * Compute active liquidity at a specific stop tick, given an initial tick and liquidity.
  *
  * @param ticks - An array of Tick objects, each containing tickIdx and liquidityNet.
  * @param currentTickIdx - The tick index where you are starting.
  * @param initialLiquidity - The active liquidity at the currentTickIdx.
  * @param stopTickIdx - The tick index where the calculation will stop. Whether movingUpward or not stop just above stopTickIdx
  *
  * @returns The computed active liquidity at the stopTickIdx.
  */
  export function computeActiveLiquidityAtStopTick(
    ticks: Tick[],
    currentTickIdx: number,
    initialLiquidity: bigint,
    stopTickIdx: number
  ): bigint{
    // Sort the tick array by tickIdx for easier traversal
    const sortedTicks = [...ticks].sort((a, b) => a.tickIdx - b.tickIdx);
  
    // Initialize state with given initial liquidity
    let state = { liquidity: initialLiquidity };
  
    // Determine the direction: true if moving upward/rightward/forward, false if moving downward/leftward/backward
    // upward movement occurs if zeroForOne is false and downward movement ocurrs if zeroForOne is true
  
    const movingUpward = stopTickIdx > currentTickIdx;
  
    for (const { tickIdx, liquidityNet } of sortedTicks) {
      // Skip ticks that are not in the path from currentTickIdx to stopTickIdx
      if (movingUpward && (tickIdx <= currentTickIdx || tickIdx >= stopTickIdx)) continue;
      if (!movingUpward && (tickIdx >= currentTickIdx || tickIdx < stopTickIdx)) continue;
  
      // If the current tick is the stop tick, we've reached the end of the path
      console.log(liquidityNet);
      // Update liquidity based on direction
      // If moving upward, we add liquidityNet. If moving downward, we subtract.
      state.liquidity += (movingUpward ? 1n : -1n) * liquidityNet;
    }
  
    return state.liquidity;
  };
