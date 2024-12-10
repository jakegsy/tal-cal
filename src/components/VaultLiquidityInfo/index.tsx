import { useMemo } from 'react';
import { NATIVE_QUOTE_TOKENS } from '../../constants/tokens';
import { useAllNativeVaultsLiquidity, useVaultLiquidity } from '../../hooks/useNativeVaultLiquidity';


interface VaultLiquidityInfoProps {
  pairToken: string;
  showTotalPairableValue: boolean;
  priceRange: number;
}

export function VaultLiquidityInfo({ pairToken, showTotalPairableValue, priceRange }: VaultLiquidityInfoProps) {
  if (!showTotalPairableValue) return null;

  return (
    <div className="mt-2 text-sm text-gray-500 text-right">
      Total Pairable Value: {
        pairToken 
          ? <SingleVaultInfo pairToken={pairToken} priceRange={priceRange} />
          : <TotalVaultInfo priceRange={priceRange} />
      }
    </div>
  );
} 

// New component for single vault info
export function SingleVaultInfo({ pairToken, priceRange }: { pairToken: string; priceRange: number }) {
    const selectedVault = useMemo(() => {
      if (!pairToken) return undefined;
      return NATIVE_QUOTE_TOKENS.find(
        token => token.address.toLowerCase() === pairToken.toLowerCase()
      )?.vaultAddress;
    }, [pairToken]);
    const { cashInUSD: selectedVaultCash, loading: selectedVaultLoading } = useVaultLiquidity(selectedVault ?? '');
    
    if (selectedVaultLoading) {
        return (
            <div className="inline-block animate-pulse">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </div>
        );
    }
    return <div>
      ${selectedVaultCash?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '???'}
    </div>;
  } 

  // New component for total vaults info
export function TotalVaultInfo({ priceRange }: { priceRange: number }) {
    const { totalCashInUSD, loading: vaultsLoading } = useAllNativeVaultsLiquidity();
  
    if (vaultsLoading) {
        return (
            <div className="inline-block animate-pulse">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </div>
        );
    }
    
    return <div>
      ${totalCashInUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>;
  } 