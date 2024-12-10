import { useState, useEffect } from 'react';
import { uniswapV3Service, PoolData } from '../services/uniswapV3';
import { isValidEthereumAddress } from '../utils/validation';

export function useUniswapV3PoolData(poolAddress?: string) {
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!poolAddress || !isValidEthereumAddress(poolAddress)) {
      setPoolData(null);
      setError(null);
      return;
    }

    let mounted = true;
    setLoading(true);

    uniswapV3Service
      .getPoolData(poolAddress)
      .then((data) => {
        if (mounted) {
          setPoolData(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.warn(`Failed to fetch pool data for ${poolAddress}:`, err);
          setError(err);
          setPoolData(null);
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

  return { poolData, loading, error };
}