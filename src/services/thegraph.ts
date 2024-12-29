import { createClient, cacheExchange, fetchExchange } from 'urql';
import { useQuery } from '@tanstack/react-query';




// Get API key from environment variable
const getApiKey = () => {
  // Try import.meta.env first (for Vite/browser)
  
  
  const viteApiKey = import.meta.env?.VITE_THEGRAPH_API_KEY;
  if (viteApiKey) {
    return viteApiKey;
  }
  
  // Try process.env as fallback (for Node.js/testing)
  const nodeApiKey = process.env.VITE_THEGRAPH_API_KEY;
  if (nodeApiKey) {
    return nodeApiKey;
  }
  

  throw new Error('VITE_THEGRAPH_API_KEY environment variable is required');
};



// Create client function
const createGraphClient = (apiKey: string) => {
  const url = `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`;
  return createClient({
    url,
    exchanges: [cacheExchange, fetchExchange],
  });
};

// Query keys for React Query
export const graphQueryKeys = {
  pool: (poolAddress: string) => ['pool', poolAddress] as const,
  token: (tokenAddress: string) => ['token', tokenAddress] as const,
  ticks: (poolAddress: string, startTick: number, endTick: number) => 
    ['ticks', poolAddress, startTick, endTick] as const,
};

// Token data type
export interface Token {
  symbol: string;
  id: string;
  decimals: string;
}

// Pool data type
export interface PoolData {
  tick: string;
  token0: Token;
  token1: Token;
  feeTier: string;
  sqrtPrice: string;
  liquidity: string;
}

// Tick data type
export interface TickData {
  id: string;
  tickIdx: string;
  liquidityGross: string;
  liquidityNet: string;
  price0: string;
  price1: string;
}

// Calculate cumulative liquidity by summing liquidityNet
export function sumLiquidityNet(ticksData: TickData[]): bigint {
  return ticksData.reduce((sum, tick) => {
    return sum + BigInt(tick.liquidityNet);
  }, BigInt(0));
}

// Pool query
const POOL_QUERY = `
  query getPool($poolAddress: String!) {
    pool(id: $poolAddress) {
      tick
      token0 {
        symbol
        id
        decimals
      }
      token1 {
        symbol
        id
        decimals
      }
      feeTier
      sqrtPrice
      liquidity
    }
  }
`;

// Ticks query
const TICKS_QUERY = `
  query getTicks($poolAddress: String!, $startTick: Int!, $endTick: Int!, $skip: Int = 0) {
    ticks(
      first: 1000
      skip: $skip
      where: {
        pool: $poolAddress
        tickIdx_gte: $startTick
        tickIdx_lte: $endTick
        liquidityGross_gt: "0"
      }
      orderBy: tickIdx
      orderDirection: asc
    ) {
      id
      tickIdx
      liquidityGross
      liquidityNet
      price0
      price1
    }
  }
`;

// Service functions that integrate with React Query
export const graphService = {
  getPool: async (poolAddress: string): Promise<PoolData> => {
    console.log('graphService.getPool called with:', poolAddress);
    const apiKey = getApiKey();
    const client = createGraphClient(apiKey);
    console.log('Fetching pool data from TheGraph...');
    const { data, error } = await client.query(POOL_QUERY, { poolAddress: poolAddress.toLowerCase() }).toPromise();
    
    if (error) {
      console.error('TheGraph API error:', error);
      throw error;
    }
    if (!data?.pool) {
      console.error('Pool not found:', poolAddress);
      throw new Error('Pool not found');
    }
    
    console.log('Pool data received:', data.pool);
    return data.pool;
  },

  getTicks: async (poolAddress: string, startTick: number, endTick: number): Promise<TickData[]> => {
    const apiKey = getApiKey();
    const client = createGraphClient(apiKey);
    
    // Ensure startTick is always smaller than endTick
    const [minTick, maxTick] = startTick < endTick 
      ? [startTick, endTick] 
      : [endTick, startTick];

    let allTicks: TickData[] = [];
    let skip = 0;
    
    while (true) {
      const { data, error } = await client.query(TICKS_QUERY, {
        poolAddress: poolAddress.toLowerCase(),
        startTick: minTick,
        endTick: maxTick,
        skip
      }).toPromise();
      
      if (error) throw error;
      if (!data?.ticks || data.ticks.length === 0) break;
      
      allTicks = [...allTicks, ...data.ticks];
      if (data.ticks.length < 1000) break;
      
      skip += 1000;
    }

    // If the original range was reversed, reverse the ticks array
    return startTick > endTick ? allTicks.reverse() : allTicks;
  },
};

// React Query hooks
export const usePoolData = (poolAddress?: string) => {
  console.log('usePoolData called with:', poolAddress);
  return useQuery({
    queryKey: graphQueryKeys.pool(poolAddress),
    queryFn: () => {
      if (!poolAddress) throw new Error('Pool address is required');
      return graphService.getPool(poolAddress);
    },
    enabled: Boolean(poolAddress),
    staleTime: 30000, // Consider data stale after 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};

export const useTicksData = (poolAddress: string, startTick: number, endTick: number) => {
  return useQuery({
    queryKey: graphQueryKeys.ticks(poolAddress, startTick, endTick),
    queryFn: () => graphService.getTicks(poolAddress, startTick, endTick),
    enabled: Boolean(poolAddress) && typeof startTick === 'number' && typeof endTick === 'number',
    staleTime: 30000, // Consider data stale after 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};