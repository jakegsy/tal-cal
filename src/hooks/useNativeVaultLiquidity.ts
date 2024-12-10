import { useMemo } from 'react';
import { useNativeVault } from './useNativeVault';
import { useTokenPrice } from './useCoinGeckoPrice';
import { NATIVE_QUOTE_TOKENS } from '../constants/tokens';

interface VaultLiquidityResult {
  cash: bigint;
  cashInUSD: number;
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
  console.log("useVaultLiquidity for tokenInfo: %s", tokenInfo?.symbol);
  // Get token price from CoinGecko
  const { price: tokenPrice, loading: priceLoading } = useTokenPrice({
    address: tokenInfo?.address ?? '',
    platform: 'ethereum',
    refreshInterval: 60000
  });
  console.log("useVaultLiquidity for tokenPrice: %s", tokenPrice);

  return useMemo(() => {
    // If there's no vault address, return default values
    console.log("useVaultLiquidity for vaultAddress: %s", vaultAddress);
    if (!vaultAddress) {
      return {
        cash: 0n,
        cashInUSD: null,
        loading: false,
        error: null,
        refetch: async () => {}
      };
    }
    // If there's an error, log it and return zero cash
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
    console.log("useVaultLiquidity for cash: %s", cash);
    const decimals = tokenInfo?.decimals ?? 18;
    console.log("useVaultLiquidity for decimals: %s", decimals);
    // Ensure tokenPrice is a valid integer before converting to BigInt
 
    const cashInUSD = tokenPrice != null 
    // TODO: may cause strange approximations if token near 1 or 0
      ? Number((cash * BigInt(Math.round(tokenPrice))) / (BigInt(10) ** BigInt(decimals)))
      : null;
    console.log("useVaultLiquidity for cashInUSD: %s", cashInUSD);
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