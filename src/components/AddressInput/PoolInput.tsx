import { usePoolData } from '../../services/thegraph';
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
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium">
            {poolData.token0.symbol}-{poolData.token1.symbol}
          </span>
          <span className="text-xs text-gray-500">
            {(Number(poolData.feeTier) / 10000).toFixed(2)}%
          </span>
        </div>
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