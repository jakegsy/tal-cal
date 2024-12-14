import { useMemo } from 'react';
import { AddressInput } from './AddressInput';
import { NATIVE_QUOTE_TOKENS } from '../../constants/tokens';
import { isValidEthereumAddress } from '../../utils/validation';
import { NativeLiquidityTokens } from '../NativeLiquidityTokens';
import { VaultLiquidityInfo } from '../LiquidityInfo/NativeVaultLiquidityInfo';

const styles = {
  badge: 'text-sm font-medium text-gray-500',
  container: 'space-y-2'
};

interface PairInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hideLabel?: boolean;
  priceRange?: number;
}

export function PairInput({
  value,
  onChange,
  label = "Pair Token",
  hideLabel = false,
  priceRange = 0.1
}: PairInputProps) {
  const validateToken = (address: string) => {
    return NATIVE_QUOTE_TOKENS.some(
      token => token.address.toLowerCase() === address.toLowerCase()
    );
  };

  const error = value && isValidEthereumAddress(value) && !validateToken(value)
    ? "Only USDC, USDT, WETH, and WBTC are supported for Native Liquidity"
    : undefined;

  const badge = useMemo(() => {
    if (!value || !isValidEthereumAddress(value)) {
      return <NativeLiquidityTokens onSelect={onChange} />;
    }
    
    const nativeToken = NATIVE_QUOTE_TOKENS.find(
      token => token.address.toLowerCase() === value.toLowerCase()
    );
    
    if (nativeToken) {
      return (
        <div className="flex items-center gap-4">
          <span className={styles.badge}>{`${nativeToken.name} (${nativeToken.symbol})`}</span>
          <NativeLiquidityTokens onSelect={onChange} />
        </div>
      );
    }
    
    return <NativeLiquidityTokens onSelect={onChange} />;
  }, [value, onChange]);

  return (
    <div className={styles.container}>
      <div className="flex flex-col gap-2">
        <AddressInput
          value={value}
          onChange={onChange}
          label={label}
          badge={badge}
          hideLabel={hideLabel}
          placeholder="Enter pair token address"
          validate={validateToken}
          error={error}
        />
        <div className="flex justify-end">
          <VaultLiquidityInfo 
            pairToken={value}
            showTotalPairableValue={true}
            priceRange={priceRange}
          />
        </div>
      </div>
    </div>
  );
}