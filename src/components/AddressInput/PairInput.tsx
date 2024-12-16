import { useMemo } from 'react';
import { AddressInput } from './AddressInput';
import { isValidEthereumAddress } from '../../utils/validation';
import { NativeLiquidityTokens } from './NativeLiquidityTokens';
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
    return isValidEthereumAddress(address);
  };

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
          placeholder="Enter pair token address"
          validate={validateToken}
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