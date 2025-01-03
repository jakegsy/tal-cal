import { useQuery } from '@tanstack/react-query';
import { coinGeckoService } from '../services/coingecko';
import { ethereumService } from '../services/ethereum';
import { TokenInfo } from '../services/ethereum';

export function useTokenPrice(address: string | undefined, platform: string = 'ethereum') {
  return useQuery({
    queryKey: ['tokenPrice', address, platform],
    queryFn: () => {
      if (!address) throw new Error('Token address is required');
      return coinGeckoService.getTokenPrice(address, platform);
    },
    staleTime: 1000 * 30, // 30 seconds
    cacheTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!address,
  });
}

export function useTokenInfo(address: string | undefined) {
  return useQuery<TokenInfo>({
    queryKey: ['tokenInfo', address],
    queryFn: () => {
      if (!address) throw new Error('Token address is required');
      return ethereumService.getTokenInfo(address);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!address,
  });
}

export function useTokenBalance(tokenAddress: string | undefined, holderAddress: string | undefined) {
  return useQuery({
    queryKey: ['tokenBalance', tokenAddress, holderAddress],
    queryFn: () => {
      if (!tokenAddress || !holderAddress) throw new Error('Token and holder addresses are required');
      return ethereumService.getTokenBalance(tokenAddress, holderAddress);
    },
    staleTime: 1000 * 15, // 15 seconds
    cacheTime: 1000 * 60, // 1 minute
    enabled: !!tokenAddress && !!holderAddress,
  });
}

export function useTokenData(tokenId: string | undefined, poolAddress: string) {
  const { data: balance, isLoading: balanceLoading } = useTokenBalance(tokenId || '', poolAddress);
  const { data: price, isLoading: priceLoading } = useTokenPrice(tokenId || '');
  return { balance, price, isLoading: balanceLoading || priceLoading };
}