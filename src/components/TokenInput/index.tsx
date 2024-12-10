import { AddressInput } from '../AddressInput';
import { PoolPairInfo } from '../PoolPairInfo';
import { NativeLiquidityTokens } from '../NativeLiquidityTokens';
import { useTokenInfo } from '../../hooks/useTokenInfo';
import { VaultLiquidityInfo } from '../VaultLiquidityInfo';
import { useCallback, useMemo } from 'react';

type LiquidityType = 'uniswap_v3' | 'native';

interface TokenInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  liquidityType: LiquidityType;
  isBase: boolean;
}

export function TokenInput({
  label,
  value,
  onChange,
  liquidityType,
  isBase
}: TokenInputProps) {
  const { tokenInfo, loading } = useTokenInfo(value || undefined);

  const renderBadge = useCallback(() => {
    if (!isBase && liquidityType === 'native') {
      return <NativeLiquidityTokens onSelect={onChange} />;
    }
    
    if (loading) {
      return <span className="text-xs text-gray-500">Loading...</span>;
    }

    if (isBase && tokenInfo) {
      return <span className="text-xs text-gray-500">{`${tokenInfo.name} (${tokenInfo.symbol})`}</span>;
    }

    if (!isBase && liquidityType === 'uniswap_v3' && value) {
      return <PoolPairInfo poolAddress={value} />;
    }

    return null;
  }, [isBase, liquidityType, loading, tokenInfo, value, onChange]);

  const hasError = !loading && !tokenInfo && value && liquidityType !== 'uniswap_v3';

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {renderBadge()}
      </div>
      <div className={`relative ${hasError ? 'border border-red-500' : ''}`}>
        <AddressInput
          value={value}
          onChange={onChange}
          placeholder={liquidityType === 'uniswap_v3' ? "Enter pool address" : "Enter token address"}
          isNativeLiquidity={liquidityType === 'native'}
          hideLabel
        />
        {hasError && (
          <p className="text-xs text-red-500 mt-1">Invalid token address</p>
        )}
      </div>
    </div>
  );
} 



interface TokenInputSectionProps {
    baseToken: string;
    pairToken: string;
    liquidityType: LiquidityType;
    priceRange: number;
    onBaseTokenChange: (value: string) => void;
    onPairTokenChange: (value: string) => void;
  }
  
  export function TokenInputSection({
    baseToken,
    pairToken,
    liquidityType,
    priceRange,
    onBaseTokenChange,
    onPairTokenChange,
  }: TokenInputSectionProps) {
    const showNativeLiquidity = useMemo(
      () => liquidityType === 'native' && Boolean(baseToken),
      [liquidityType, baseToken]
    );
  
    return (
      <>
        <TokenInput
          label="Base Token:"
          value={baseToken}
          onChange={onBaseTokenChange}
          liquidityType={liquidityType}
          isBase={true}
        />
  
        <div className="relative">
          <TokenInput
            label={liquidityType === 'uniswap_v3' ? "Pool Address:" : "Pair Token:"}
            value={pairToken}
            onChange={onPairTokenChange}
            liquidityType={liquidityType}
            isBase={false}
          />
          
          {showNativeLiquidity && (
            <VaultLiquidityInfo 
              pairToken={pairToken}
              showTotalPairableValue={showNativeLiquidity}
              priceRange={priceRange}
            />
          )}
        </div>
      </>
    );
  } 