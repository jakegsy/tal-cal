import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { NATIVE_QUOTE_TOKENS } from '../../constants/tokens';
import { useNativeVault } from '../../hooks/useNativeVault';
import { useAllNativeVaultsLiquidity } from '../../hooks/useNativeVaultLiquidity';
import { formatCurrency, formatTokenAmount } from '../../utils/format';


interface NativeVaultPoolInfoDisplayProps {
  baseToken: string;
  pairToken: string;
}

export function NativeVaultPoolInfoDisplay({
  baseToken,
  pairToken,
}: NativeVaultPoolInfoDisplayProps) {
  const selectedVault = useMemo(() => (NATIVE_QUOTE_TOKENS.find(
    token => token.address.toLowerCase() === pairToken.toLowerCase()
  )?.vaultAddress), [pairToken]);
  const { vaultData, loading: poolLoading, error:poolError } = useNativeVault(selectedVault);
  const { vaultResults, totalCashInUSD, loading: vaultsLoading } = useAllNativeVaultsLiquidity();

  const baseTokenInfo = useMemo(() => NATIVE_QUOTE_TOKENS.find(token => token.address.toLowerCase() === baseToken.toLowerCase()), [baseToken]);
  const pairTokenInfo = useMemo(() => ({
    symbol: vaultData?.symbol.replace('AQ LP ', ''),
    decimals: vaultData?.decimals,
  }), [vaultData]);

  const [baseTokenAmt, pairTokenAmt] = useMemo(() => {
    let baseTokenAmt, pairTokenAmt;
    vaultResults.forEach((result) => {
      if (result.address.toLowerCase() === baseToken.toLowerCase()) {
        baseTokenAmt = new BigNumber(result.cash.toString())
          .div(10 ** Number(baseTokenInfo.decimals)).toString();
      }
      if (result.address.toLowerCase() === pairToken.toLowerCase()) {
        pairTokenAmt = new BigNumber(result.cash.toString())
          .div(10 ** Number(pairTokenInfo.decimals)).toString();
      }
    });
    return [baseTokenAmt, pairTokenAmt]
  }, [
    baseTokenInfo,
    pairTokenInfo,
    baseToken,
    pairToken,
    vaultResults,
  ]);
  
  // Early return for loading and error states
  if (poolLoading) {
    return (
      <div className="mt-6 bg-gray-50 rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // pool info empty
  if (poolError || !vaultData) {
    return (
      <div className="mt-6 bg-red-50 text-red-600 rounded-lg p-6">
        {poolError?.message || 'Failed to load pool information'}
      </div>
    );
  }

  const poolName = `Native Vault ${baseTokenInfo?.symbol}-${pairTokenInfo?.symbol}`;

  return (
    <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Pool:</span>
          <span>{poolName}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Pooled Base Token:</span>
          <span>
            {poolLoading ? "Loading..." : `${formatTokenAmount(baseTokenAmt)} ${baseTokenInfo?.symbol}`}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Pooled Paired Token:</span>
          <span>
            {poolLoading ? "Loading..." : `${formatTokenAmount(pairTokenAmt)} ${pairTokenInfo?.symbol}`}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Native Pool USD:</span>
          <span>
            {vaultsLoading ? "Loading..." : formatCurrency(totalCashInUSD)}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2 mt-6">
        <button 
          onClick={() => window.open(`https://native.org/app/credit-pool/?tab=markets`, '_blank')}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          View Pool
        </button>
        <button 
          onClick={() => window.open(`https://native.org/app/credit-pool/?tab=markets`, '_blank')}
          className="px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600"
        >
          Add Liquidity
        </button>
      </div>
    </div>
  );
}