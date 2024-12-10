import { useState, useEffect } from 'react';
import { ethereumService, TokenInfo } from '../services/ethereum';
import { isValidEthereumAddress } from '../utils/validation';
import { useCache } from './useCache';

const CACHE_DURATION_MS = 60 * 1000; // 1 minute

export function useTokenInfo(tokenAddress: string | undefined) {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { get: getCache, set: setCache } = useCache();

  useEffect(() => {
    if (!tokenAddress || !isValidEthereumAddress(tokenAddress)) {
      setTokenInfo(null);
      setError(null);
      return;
    }

    let mounted = true;
    setLoading(true);

    // Try to get from cache first
    const cachedInfo = getCache(`token-info-${tokenAddress}`);
    if (cachedInfo) {
      setTokenInfo(cachedInfo);
      setLoading(false);
      return;
    }

    ethereumService
      .getTokenInfo(tokenAddress)
      .then((info) => {
        if (mounted) {
          setTokenInfo(info);
          setError(null);
          // Cache the result with 1-minute expiration
          setCache(`token-info-${tokenAddress}`, info, CACHE_DURATION_MS);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.warn(`Failed to fetch token info for ${tokenAddress}:`, err);
          setError(err);
          setTokenInfo(null);
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
  }, [tokenAddress]);

  return { tokenInfo, loading, error };
}