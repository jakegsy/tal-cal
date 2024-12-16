import { priceToClosestTick, tickToPrice } from "@uniswap/v3-sdk";

// Q96 is a constant representing 2^96
const Q96 = Math.pow(2, 96);
const PERCENTAGE_BASE = 100;

export function calculateLiquidity(
    totalLiquidity: bigint,
    startSqrtPriceX96: number,
    endSqrtPriceX96: number,
    isToken0Base: boolean
): number {
    // Convert to decimal for precision
    const L = Number(totalLiquidity);
    
    if (isToken0Base) {
        // For token0 (USDC): Δx = L * (√pb - √pa) / Q96
        return L * Math.abs(endSqrtPriceX96 - startSqrtPriceX96) / Q96 ;
    } else {
        // For token1 (ETH): Δy = L * (1/√pa - 1/√pb)
        // First convert sqrt prices to decimal
        const sa = startSqrtPriceX96 / Q96;
        const sb = endSqrtPriceX96 / Q96;
        return L * Math.abs(1/sa - 1/sb);
    }
} 

export interface PriceCalculationResult {
    startPrice: number;
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
    isToken0Base: boolean,
    priceRange: number
): PriceCalculationResult {
    //starting off with sq(start price).2^96
    const startSqrtPriceX96 = sqrtPriceX96;
    //retrieve start price by squaring and getting start price.2^192
    const startPriceX96 = startSqrtPriceX96 * startSqrtPriceX96;
    //divide by 2^192 to get startPrice, note that decimal difference remains  
    const startPrice = startPriceX96 / Q96 / Q96;
    //note that startPrice is amounts of token 1 per token 0, and scales by
    //10**(token1.decimals - token0.decimals)
    //this will be for amounts of token 0 per token 1, redundantly done in case isToken0Base is false
    const invStartPrice = 1 / startPrice;

    //calculating in positive direction for both prices, taking care to perform it
    //inverted appropriately 
    const targetPrice = isToken0Base
        ? 1 / (invStartPrice * (PERCENTAGE_BASE + priceRange) / PERCENTAGE_BASE)
        : startPrice * (PERCENTAGE_BASE + priceRange) / PERCENTAGE_BASE;

    //this has the effect of having the correct targetPrice here
    const endSqrtPriceX96 = Math.sqrt(targetPrice * (Q96 * Q96));
    
    return {
        startPrice,
        targetPrice,
        startSqrtPriceX96,
        endSqrtPriceX96
    };
} 


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
      // Update liquidity based on direction
      // If moving upward, we add liquidityNet. If moving downward, we subtract.
      state.liquidity += (movingUpward ? 1n : -1n) * liquidityNet;
    }
  
    return state.liquidity;
  };
