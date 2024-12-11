import { ethers } from 'ethers';
import { UNISWAP_V3_POOL_ABI } from '../contracts/uniswapV3';
import { ethereumService } from './ethereum';
import { Tick, computeActiveLiquidityAtStopTick } from '../utils/uniswapV3';

export interface PoolState {
  liquidity: bigint;
  sqrtPriceX96: bigint;
  tick: number;
  observationIndex: number;
  observationCardinality: number;
  observationCardinalityNext: number;
  feeProtocol: number;
  unlocked: boolean;
}

export interface PoolData {
  token0: string;
  token1: string;
  token0Decimals: number;
  token1Decimals: number;
  fee: number;
  liquidity: bigint;
  sqrtPriceX96: bigint;
  tick: number;
  token0Price: number;
  token1Price: number;
  tickSpacing: number;
}

// Use simplified Tick interface for tick data
export interface TickData {
    tickIdx: number;
    liquidityNet: bigint;
    initialized: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface Cache {
  [key: string]: CacheEntry<any>;
}

class UniswapV3Service {
  private provider: ethers.JsonRpcProvider;
  private cache: Cache = {};
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor() {
    this.provider = ethereumService.getProvider();
  }

  private getCacheKey(method: string, ...args: any[]): string {
    return `${method}:${args.join(':')}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache[key];
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      delete this.cache[key];
      return null;
    }

    return cached.data;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
    };
  }

  async getTick(poolAddress: string, tick: number): Promise<Tick> {
    const cacheKey = this.getCacheKey('getTick', poolAddress, tick);
    const cached = this.getFromCache<TickData>(cacheKey);
    if (cached) return cached;
    console.log("fresh tick call with tick number %d", tick);
    const poolContract = new ethers.Contract(
      poolAddress,
      UNISWAP_V3_POOL_ABI,
      this.provider
    );

    // Return the promise directly without awaiting
    const tickPromise = poolContract.ticks(tick).then(([liquidityGross, liquidityNet, feeGrowthOutside0X128, feeGrowthOutside1X128, tickCumulativeOutside, secondsPerLiquidityOutsideX128, secondsOutside, initialized]) => {
      const result: Tick = {
        tickIdx: tick,
        liquidityNet,
      };

      this.setCache(cacheKey, result);
      return result;
    });

    return tickPromise;
  }

  async getPoolData(poolAddress: string): Promise<PoolData> {
    const cacheKey = this.getCacheKey('getPoolData', poolAddress);
    const cached = this.getFromCache<PoolData>(cacheKey);
    if (cached) return cached;

    try {
      const poolContract = new ethers.Contract(
        poolAddress,
        UNISWAP_V3_POOL_ABI,
        this.provider
      );

      // Fetch all pool data in parallel
      const [
        token0,
        token1,
        fee,
        liquidity,
        slot0,
      ] = await Promise.all([
        poolContract.token0().catch((error: Error) => {
          throw new Error(`Failed to fetch token0: ${error.message}`);
        }),
        poolContract.token1().catch((error: Error) => {
          throw new Error(`Failed to fetch token1: ${error.message}`);
        }),
        poolContract.fee().catch((error: Error) => {
          throw new Error(`Failed to fetch fee: ${error.message}`);
        }),
        poolContract.liquidity().catch((error: Error) => {
          throw new Error(`Failed to fetch liquidity: ${error.message}`);
        }),
        poolContract.slot0().catch((error: Error) => {
          throw new Error(`Failed to fetch slot0: ${error.message}`);
        }),
      ]);

      // Get token decimals
      const [token0Info, token1Info] = await Promise.all([
        ethereumService.getTokenInfo(token0).catch((error: Error) => {
          throw new Error(`Failed to fetch token0 info: ${error.message}`);
        }),
        ethereumService.getTokenInfo(token1).catch((error: Error) => {
          throw new Error(`Failed to fetch token1 info: ${error.message}`);
        }),
      ]);

      const [sqrtPriceX96, tick] = slot0;
      
      // Calculate prices
      const token0Price = this.calculatePrice(sqrtPriceX96, Number(token0Info.decimals),   Number(token1Info.decimals));
      const token1Price = 1 / token0Price;

      const poolData: PoolData = {
        token0,
        token1,
        token0Decimals: Number(token0Info.decimals),
        token1Decimals: Number(token1Info.decimals),
        fee,
        liquidity,
        sqrtPriceX96,
        tick,
        token0Price,
        token1Price,
        tickSpacing: await poolContract.tickSpacing(),
      };

      this.setCache(cacheKey, poolData);
      return poolData;
    } catch (error) {
      console.error(`Failed to fetch pool data for ${poolAddress}:`, error);
      throw error instanceof Error ? error : new Error(`Unknown error fetching pool data for ${poolAddress}`);
    }
  }

  private calculatePrice(sqrtPriceX96: bigint, decimals0: number, decimals1: number): number {
    const price = Number(sqrtPriceX96) / 2**96;
    const adjustedPrice = price * price * (10 ** (decimals0 - decimals1));
    return adjustedPrice;
  }
  async getLiquidity(poolAddress: string, startTick: number, endTick: number, tickSpacing: number): Promise<bigint> {
    const ticks = await this.getTickRange(poolAddress, startTick, endTick, tickSpacing);
    const totalLiquidity = computeActiveLiquidityAtStopTick(ticks, startTick, 0n, endTick);
    return totalLiquidity;
  }

  async getTickRange(poolAddress: string, startTick: number, endTick: number, tickSpacing: number): Promise<Tick[]> {
    const [lowerTick, upperTick] = [
        Math.min(startTick, endTick),
        Math.max(startTick, endTick)
    ];
    console.log(`Tick Range: ${lowerTick} to ${upperTick}`);

    const tickPromises = [];
    for (let tick = lowerTick; tick <= upperTick; tick += tickSpacing) {
        tickPromises.push(
            this.getTick(poolAddress, tick)
                .then(tickData => tickData)
                .catch(error => {
                    console.error(`Error fetching tick ${tick}:`, error);
                    return null;
                })
        );
    }

    return Promise.all(tickPromises).then(results => 
        results.filter((tick): tick is Tick => tick !== null)
    );
  }
}

export const uniswapV3Service = new UniswapV3Service();