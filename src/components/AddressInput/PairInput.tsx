import { useMemo } from 'react';
import { AddressInput } from './AddressInput';
import { isValidEthereumAddress } from '../../utils/validation';
import { NativeLiquidityTokens } from './NativeLiquidityTokens';
import { VaultLiquidityInfo } from '../LiquidityInfo/NativeVaultLiquidityInfo';
import { NATIVE_QUOTE_TOKENS } from '../../constants/tokens';

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
  const savedTokens = useMemo(() => 
    NATIVE_QUOTE_TOKENS.map((token) => ({
      address: token.address,
      label: token.symbol,
    }))
  , []);

  const validateToken = (address: string) => {
    // Only allow addresses that are in NATIVE_QUOTE_TOKENS
    return isValidEthereumAddress(address) && 
      NATIVE_QUOTE_TOKENS.some(token => 
        token.address.toLowerCase() === address.toLowerCase()
      );
  };

  const error = value && !validateToken(value)
    ? "Please select a native quote token"
    : undefined;

  const badge = useMemo(() => {
    if (!value || !isValidEthereumAddress(value)) {
      return <NativeLiquidityTokens onSelect={onChange} />;
    }
    
    return (
      <div className="flex items-center gap-4">
        <NativeLiquidityTokens onSelect={onChange} />
      </div>
    );
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
          validate={validateToken}
          error={error}
          savedValues={savedTokens}
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