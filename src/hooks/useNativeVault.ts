import { useState, useEffect, useCallback } from 'react';
import { nativeVaultService, VaultData } from '../services/nativeVault';
import { isValidEthereumAddress } from '../utils/validation';

interface UseNativeVaultResult {
  vaultData: VaultData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage native vault data
 * @param vaultAddress - Ethereum address of the vault
 * @returns Object containing vault data, loading state, error state and refetch function
 */
export function useNativeVault(vaultAddress?: string): UseNativeVaultResult {
  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchVaultData = useCallback(async () => {
    if (!vaultAddress || !isValidEthereumAddress(vaultAddress)) {
      setVaultData(null);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const data = await nativeVaultService.getVaultData(vaultAddress);
      setVaultData(data);
      setError(null);
    } catch (err) {
      console.warn(`Failed to fetch vault data for ${vaultAddress}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setVaultData(null);
    } finally {
      setLoading(false);
    }
  }, [vaultAddress]);

  useEffect(() => {
    fetchVaultData();
  }, [fetchVaultData]);

  return {
    vaultData,
    loading,
    error,
    refetch: fetchVaultData
  };
} 