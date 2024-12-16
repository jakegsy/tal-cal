import { graphService } from '../thegraph';
import { createClient, cacheExchange, fetchExchange } from 'urql';

// Mock the urql client
jest.mock('urql', () => {
  const mockQuery = jest.fn();
  return {
    createClient: jest.fn(() => ({
      query: mockQuery,
    })),
    cacheExchange: {},
    fetchExchange: {},
  };
});

describe('graphService', () => {
  const mockPool = {
    tick: '123456',
    token0: {
      symbol: 'USDC',
      id: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: '6',
    },
    token1: {
      symbol: 'WETH',
      id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      decimals: '18',
    },
    feeTier: '3000',
    sqrtPrice: '1234567890',
    liquidity: '1000000',
  };

  let mockQuery: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get reference to the mocked query function
    mockQuery = (createClient() as any).query;
  });

  describe('getPool', () => {
    const poolAddress = '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8';

    it('should fetch pool data successfully', async () => {
      mockQuery.mockReturnValue({
        toPromise: () => Promise.resolve({ data: { pool: mockPool }, error: null }),
      });

      const result = await graphService.getPool(poolAddress);
      
      expect(result).toEqual(mockPool);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), { poolAddress });
    });

    it('should throw error when pool is not found', async () => {
      mockQuery.mockReturnValue({
        toPromise: () => Promise.resolve({ data: { pool: null }, error: null }),
      });

      await expect(graphService.getPool(poolAddress)).rejects.toThrow('Pool not found');
    });

    it('should throw error when query fails', async () => {
      const errorMessage = 'GraphQL query failed';
      mockQuery.mockReturnValue({
        toPromise: () => Promise.resolve({ data: null, error: new Error(errorMessage) }),
      });

      await expect(graphService.getPool(poolAddress)).rejects.toThrow(errorMessage);
    });
  });
});
