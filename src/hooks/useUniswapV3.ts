// src/hooks/useUniswapV3.ts
import { useQuery } from '@tanstack/react-query';
import { uniswapV3Service } from '../services/uniswapV3';
import type { PoolData, TickData } from '../services/uniswapV3';

export function usePoolData(poolAddress: string | undefined) {
  return useQuery<PoolData>({
    queryKey: ['uniswapV3', 'pool', poolAddress],
    queryFn: () => {
      if (!poolAddress) throw new Error('Pool address is required');
      return uniswapV3Service.getPoolData(poolAddress);
    },
    staleTime: 1000 * 30, // 30 seconds
    cacheTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!poolAddress,
  });
}

export function usePoolTicks(
  poolAddress: string | undefined,
  tickLower: number | undefined,
  tickUpper: number | undefined,
  tickSpacing: number | undefined
) {
  return useQuery<TickData[]>({
    queryKey: ['uniswapV3', 'ticks', poolAddress, tickLower, tickUpper, tickSpacing],
    queryFn: async () => {
      if (!poolAddress) throw new Error('Pool address is required');
      if (tickLower === undefined || tickUpper === undefined) {
        throw new Error('Tick range is required');
      }
      if (tickSpacing === undefined) {
        throw new Error('Tick spacing is required');
      }
      return uniswapV3Service.getTickRange(poolAddress, tickLower, tickUpper, tickSpacing);
    },
    staleTime: 1000 * 30, // 30 seconds
    cacheTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!poolAddress && tickLower !== undefined && tickUpper !== undefined && tickSpacing !== undefined,
  });
}

export function usePoolLiquidity(
  poolAddress: string | undefined,
  startTick: number | undefined,
  endTick: number | undefined,
  tickSpacing: number | undefined
) {
  return useQuery<bigint>({
    queryKey: ['uniswapV3', 'liquidity', poolAddress, startTick, endTick, tickSpacing],
    queryFn: async () => {
      if (!poolAddress) throw new Error('Pool address is required');
      if (startTick === undefined || endTick === undefined) {
        throw new Error('Tick range is required');
      }
      if (tickSpacing === undefined) {
        throw new Error('Tick spacing is required');
      }
      return uniswapV3Service.getLiquidity(poolAddress, startTick, endTick, tickSpacing);
    },
    staleTime: 1000 * 30, // 30 seconds
    cacheTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!poolAddress && startTick !== undefined && endTick !== undefined && tickSpacing !== undefined,
  });
}

// src/hooks/useNativeVault.ts
import { useQuery } from '@tanstack/react-query';
import { nativeVaultService } from '../services/nativeVault';
import type { VaultData, BorrowData } from '../services/nativeVault';

export function useVaultData(vaultAddress: string) {
  return useQuery({
    queryKey: ['nativeVault', 'vault', vaultAddress],
    queryFn: () => nativeVaultService.getVaultData(vaultAddress),
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useBorrowData(vaultAddress: string, borrowerAddress: string) {
  return useQuery({
    queryKey: ['nativeVault', 'borrow', vaultAddress, borrowerAddress],
    queryFn: () => nativeVaultService.getBorrowData(vaultAddress, borrowerAddress),
    staleTime: 1000 * 30, // 30 seconds
    cacheTime: 1000 * 60 * 5, // 5 minutes
  });
}