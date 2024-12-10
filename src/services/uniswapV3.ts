import { ethers } from 'ethers';
import { UNISWAP_V3_POOL_ABI } from '../contracts/uniswapV3';
import { ethereumService } from './ethereum';

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

// Add new interface for tick data
export interface TickData {
    liquidityGross: bigint;
    liquidityNet: bigint;
    feeGrowthOutside0X128: bigint;
    feeGrowthOutside1X128: bigint;
    tickCumulativeOutside: bigint;
    secondsPerLiquidityOutsideX128: bigint;
    secondsOutside: number;
    initialized: boolean;
}

// Add cache interface and helper
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

  async getTick(poolAddress: string, tick: number): Promise<TickData> {
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
      const result = {
        liquidityGross,
        liquidityNet,
        feeGrowthOutside0X128,
        feeGrowthOutside1X128,
        tickCumulativeOutside,
        secondsPerLiquidityOutsideX128,
        secondsOutside,
        initialized
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

    const poolContract = new ethers.Contract(
      poolAddress,
      UNISWAP_V3_POOL_ABI,
      this.provider
    );

    const [token0, token1, fee, slot0, liquidity, tickSpacing] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
      poolContract.slot0(),
      poolContract.liquidity(),
      poolContract.tickSpacing()
    ]);

    // Create ERC20 contracts to get decimals
    const token0Contract = new ethers.Contract(token0, ['function decimals() view returns (uint8)'], this.provider);
    const token1Contract = new ethers.Contract(token1, ['function decimals() view returns (uint8)'], this.provider);

    const [token0Decimals, token1Decimals] = await Promise.all([
      token0Contract.decimals(),
      token1Contract.decimals()
    ]);

    const sqrtPriceX96 = slot0[0];
    const tick = slot0[1];

    // Calculate prices
    const token0Price = this.getToken0Price(sqrtPriceX96);
    const token1Price = 1 / token0Price;

    const result = {
      token0,
      token1,
      token0Decimals,
      token1Decimals,
      fee,
      liquidity,
      sqrtPriceX96,
      tick,
      token0Price,
      token1Price,
      tickSpacing,
    };

    this.setCache(cacheKey, result);
    return result;
  }

  private getToken0Price(sqrtPriceX96: bigint): number {
    const Q96 = 2n ** 96n;
    const price = (sqrtPriceX96 * sqrtPriceX96 * 10n ** 18n) / (Q96 * Q96);
    return Number(price) / 1e18;
  }

  async getTickRange(poolAddress: string, startTick: number, endTick: number): Promise<TickData[]> {
    const poolContract = new ethers.Contract(
        poolAddress,
        UNISWAP_V3_POOL_ABI,
        this.provider
    );
    
    // Get tickSpacing first since we need it for the loop
    return poolContract.tickSpacing().then((tickSpacing: bigint) => {
      const [lowerTick, upperTick] = [
          Math.min(startTick, endTick),
          Math.max(startTick, endTick)
      ];
      console.log(`Tick Range: ${lowerTick} to ${upperTick}`);

      // Create array of promises for all tick fetches
      const tickPromises = [];
      for (let tick = lowerTick; tick <= upperTick; tick += Number(tickSpacing)) {
          tickPromises.push(
              this.getTick(poolAddress, tick)
                  .then(tickData => tickData.initialized ? tickData : null)
                  .catch(error => {
                      console.error(`Error fetching tick ${tick}:`, error);
                      return null;
                  })
          );
      }

      // Return promise that resolves to filtered array of tick data
      return Promise.all(tickPromises).then(results => 
          results.filter((tick): tick is TickData => tick !== null)
      );
    });
  }
}

export const uniswapV3Service = new UniswapV3Service();