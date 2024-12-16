import { usePoolData } from '../../hooks/useUniswapV3';
import { AddressInput } from './AddressInput';
import { PoolPairInfo } from '../PoolPairInfo';
import { isValidEthereumAddress } from '../../utils/validation';

interface PoolInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hideLabel?: boolean;
}

export function PoolInput({
  value,
  onChange,
  label = "Pool",
  hideLabel = false
}: PoolInputProps) {
  const shouldFetchPool = value && isValidEthereumAddress(value);
  const { data: poolData, isLoading } = usePoolData(shouldFetchPool ? value : undefined);

  const validatePool = (address: string) => {
    return isValidEthereumAddress(address);
  };

  const badge = value ? (
    <div className="flex items-center">
      {isLoading ? (
        <span className="text-sm font-medium text-gray-500">Loading...</span>
      ) : poolData ? (
        <PoolPairInfo poolAddress={value} />
      ) : null}
    </div>
  ) : null;

  return (
    <div>
      <AddressInput
        value={value}
        onChange={onChange}
        label={label}
        badge={badge}
        hideLabel={hideLabel}
        placeholder="Enter pool address"
        validate={validatePool}
      />
    </div>
  );
}