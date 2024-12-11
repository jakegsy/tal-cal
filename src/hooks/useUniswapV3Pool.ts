import { useState, useEffect } from 'react';
import { isValidEthereumAddress } from '../utils/validation';
import { uniswapV3Service, PoolData } from '../services/uniswapV3';


export function useUniswapV3Pool(poolAddress?: string) {
  const [poolInfo, setPoolInfo] = useState<PoolData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!poolAddress || !isValidEthereumAddress(poolAddress)) {
      setPoolInfo(null);
      setError(null);
      return;
    }

    let mounted = true;
    setLoading(true);

    uniswapV3Service
      .getPoolData(poolAddress)
      .then((data) => {
        if (mounted) {
          setPoolInfo(data);
          setError(null);
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