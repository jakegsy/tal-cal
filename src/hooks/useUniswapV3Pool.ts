import { useState, useEffect } from 'react';
import { isValidEthereumAddress } from '../utils/validation';
import { uniswapV3Service, PoolData } from '../services/uniswapV3';
import { useCache } from './useCache';

const CACHE_DURATION_MS = 60 * 1000; // 1 minute

export function useUniswapV3Pool(poolAddress?: string) {
  const [poolInfo, setPoolInfo] = useState<PoolData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { get: getCache, set: setCache } = useCache();

  useEffect(() => {
    console.log("pool!")
    if (!poolAddress || !isValidEthereumAddress(poolAddress)) {
      setPoolInfo(null);
      setError(null);
      return;
    }

    let mounted = true;
    setLoading(true);

    // Try to get from cache first
    const cachedInfo = getCache(`pool-data-${poolAddress}`);
    if (cachedInfo) {
      setPoolInfo(cachedInfo);
      setLoading(false);
      return;
    }

    uniswapV3Service
      .getPoolData(poolAddress)
      .then((data) => {
        if (mounted) {
          setPoolInfo(data);
          setError(null);
          // Cache the result with 1-minute expiration
          setCache(`pool-data-${poolAddress}`, data, CACHE_DURATION_MS);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.warn(`Failed to fetch pool info for ${poolAddress}:`, err);
          setError(err);
          setPoolInfo(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [poolAddress]);

  return { poolInfo, loading, error };
}