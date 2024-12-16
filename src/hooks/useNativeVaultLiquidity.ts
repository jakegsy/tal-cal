import { useMemo } from 'react';
import { useNativeVault } from './useNativeVault';
import { useTokenPrice } from './useTokenData';
import { NATIVE_QUOTE_TOKENS } from '../constants/tokens';

interface VaultLiquidityResult {
  cash: bigint;
  cashInUSD: number | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface AllVaultsLiquidityResult {
  totalCash: bigint;
  totalCashInUSD: number;
  loading: boolean;
  errors: Error[] | undefined;
  refetchAll: () => Promise<void>;
}

/**
 * Hook to fetch liquidity data for a single vault
 * @param vaultAddress - Ethereum address of the vault
 * @returns Object containing cash amount, loading state, and error state
 */
export function useVaultLiquidity(vaultAddress?: string): VaultLiquidityResult {
  const { vaultData, loading: vaultLoading, error, refetch } = useNativeVault(vaultAddress);

  // Find token info for the vault
  const tokenInfo = useMemo(() => 
    NATIVE_QUOTE_TOKENS.find(token => token.vaultAddress === vaultAddress),
    [vaultAddress]
  );

  // Get token price from CoinGecko using React Query
  const { data: tokenPrice, isLoading: priceLoading } = useTokenPrice(tokenInfo?.address);

  return useMemo(() => {
    if (!vaultAddress) {
      return {
        cash: 0n,
        cashInUSD: null,
        loading: false,
        error: null,
        refetch: async () => {}
      };
    }

    if (error) {
      console.warn(`Failed to fetch vault data for ${vaultAddress}:`, error);
      return {
        cash: 0n,
        cashInUSD: null,
        loading: false,
        error,
        refetch
      };
    }

    const cash = vaultData?.cash ?? 0n;
    const decimals = tokenInfo?.decimals ?? 18;
 
    const cashInUSD = tokenPrice != null 
      ? Number((cash * BigInt(Math.round(tokenPrice * 1e8)) / BigInt(1e8)) / (BigInt(10) ** BigInt(decimals)))
      : null;

    return {
      cash,
      cashInUSD,
      loading: vaultLoading || priceLoading,
      error: null,
      refetch
    };
  }, [vaultAddress, vaultData, vaultLoading, priceLoading, error, refetch, tokenPrice, tokenInfo]);
}

/**
 * Hook to fetch liquidity data for all native vaults
 * @returns Object containing total cash, loading state, and array of errors if any
 */
export function useAllNativeVaultsLiquidity(): AllVaultsLiquidityResult {
  const vaultResults = NATIVE_QUOTE_TOKENS.map(token => 
    useVaultLiquidity(token.vaultAddress)
  );
  console.log("Vault results: %s", vaultResults);

  const result = useMemo(() => {
    const isLoading = vaultResults.some(result => result.loading);
    const errors = vaultResults
      .filter(result => result.error)
      .map(result => result.error!)
      .filter(Boolean);

    const totalCash = vaultResults.reduce((sum, result) => 
      sum + result.cash, 0n
    );

    const totalCashInUSD = vaultResults.reduce((sum, result) => 
      sum + (result.cashInUSD ?? 0), 0
    );

    const refetchAll = async () => {
      await Promise.all(vaultResults.map(result => result.refetch()));
    };

    return {
      totalCash,
      totalCashInUSD,
      loading: isLoading,
      errors: errors.length > 0 ? errors : undefined,
      refetchAll
    };
  }, [vaultResults]);

  return result;
} 