import { useState, useEffect } from 'react';
import { CoinGeckoService } from '../services/coingecko';
import { useCache } from './useCache';

const coinGeckoService = new CoinGeckoService();

interface UseTokenPriceProps {
  address: string;
  platform?: string;
  refreshInterval?: number;
}

export const useTokenPrice = ({
  address,
  platform = 'ethereum',
  refreshInterval = 60000 // 1 minute default
}: UseTokenPriceProps) => {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cache = useCache();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchPrice = async () => {
      try {
        const cacheKey = `price_${platform}_${address}`;
        const cachedPrice = cache.get<number>(cacheKey);

        if (cachedPrice !== null) {
          setPrice(cachedPrice);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        
        const newPrice = await coinGeckoService.getTokenPrice(address, platform);
        setPrice(newPrice);
        // Cache the price for 1 minute
        cache.set(cacheKey, newPrice, 60000);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch price'));
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();

    if (refreshInterval > 0) {
      intervalId = setInterval(fetchPrice, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [address, platform, refreshInterval, cache]);

  return { price, loading, error };
}; 