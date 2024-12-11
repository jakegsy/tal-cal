import { useUniswapV3Pool } from '../../hooks/useUniswapV3Pool';
import { AddressInput } from './AddressInput';
import { PoolPairInfo } from '../PoolPairInfo';

const styles = {
  badge: 'text-sm font-medium text-gray-500'
};

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
  const { poolData, loading } = useUniswapV3Pool(value || undefined);

  const badge = loading 
    ? <span className={styles.badge}>Loading...</span>
    : value 
      ? <PoolPairInfo poolAddress={value} />
      : null;

  return (
    <div>
      <AddressInput
        value={value}
        onChange={onChange}
        label={label}
        badge={badge}
        hideLabel={hideLabel}
        placeholder="Enter pool address"
      />
    </div>
  );
}