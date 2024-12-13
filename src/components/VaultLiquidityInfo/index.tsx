import { useMemo } from 'react';
import { NATIVE_QUOTE_TOKENS } from '../../constants/tokens';
import { useAllNativeVaultsLiquidity, useVaultLiquidity } from '../../hooks/useNativeVaultLiquidity';
import { isValidEthereumAddress } from '../../utils/validation';
import { ExternalLink } from 'lucide-react';

interface VaultLiquidityInfoProps {
  pairToken: string;
  showTotalPairableValue: boolean;
  priceRange: number;
}

export function VaultLiquidityInfo({ pairToken, showTotalPairableValue, priceRange }: VaultLiquidityInfoProps) {
  if (!showTotalPairableValue) return null;

  const isValidNativeToken = pairToken && 
    isValidEthereumAddress(pairToken) && 
    NATIVE_QUOTE_TOKENS.some(token => token.address.toLowerCase() === pairToken.toLowerCase());

  const getValue = () => {
    if (!pairToken || pairToken.trim() === '') {
      return <TotalVaultInfo priceRange={priceRange} />;
    }
    if (isValidNativeToken) {
      return <SingleVaultInfo pairToken={pairToken} priceRange={priceRange} />;
    }
    return '???';
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="inline-block">
        Total Pairable Value: {getValue()}
      </span>
    </div>
  );
} 

// New component for single vault info
export function SingleVaultInfo({ pairToken, priceRange }: { 
    pairToken: string; 
    priceRange: number;
}) {
    const selectedVault = useMemo(() => {
      if (!pairToken) return undefined;
      return NATIVE_QUOTE_TOKENS.find(
        token => token.address.toLowerCase() === pairToken.toLowerCase()
      )?.vaultAddress;
    }, [pairToken]);
    const { cashInUSD: selectedVaultCash, loading: selectedVaultLoading } = useVaultLiquidity(selectedVault ?? '');
    
    if (selectedVaultLoading) {
        return (
            <span className="inline-block animate-pulse">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </span>
        );
    }

    return (
        <span className="inline-block">
            ${selectedVaultCash?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '???'}
        </span>
    );
} 

// New component for total vaults info
export function TotalVaultInfo({ priceRange }: { priceRange: number }) {
    const { totalCashInUSD, loading: vaultsLoading } = useAllNativeVaultsLiquidity();
  
    if (vaultsLoading) {
        return (
            <span className="inline-block animate-pulse">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </span>
        );
    }
    
    return (
        <span className="inline-block">
            ${totalCashInUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
    );
}