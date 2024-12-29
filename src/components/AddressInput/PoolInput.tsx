import { AddressInput } from './AddressInput';
import { PoolPairInfo } from '../PoolPairInfo';
import { useMemo } from 'react';
import { useUniswapV3Pool } from '../../hooks/useUniswapV3Pool';

const styles = {
  badge: 'text-sm font-medium text-gray-500'
};

// Popular Uniswap V3 pools
const POPULAR_POOLS = [
  {
    address: "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8",
    label: "USDC/ETH 0.3%",
  },
  {
    address: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
    label: "USDC/ETH 0.05%",
  },
  {
    address: "0x7bea39867e4169dbe237d55c8242a8f2fcdcc387",
    label: "USDC/ETH 1%",
  },
  {
    address: "0x4e68ccd3e89f51c3074ca5072bbac773960dfa36",
    label: "WETH/USDT 0.3%",
  },
  {
    address: "0xCBCdF9626bC03E24f779434178A73a0B4bad62eD",
    label: "WBTC/ETH 0.3%",
  },
];

// value is the pairToken address
interface PoolInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hideLabel?: boolean;
  onPairInfoChange?: (pairInfo: string) => void;
}

export function PoolInput({
  value,
  onChange,
  label = "Pool",
  hideLabel = false,
  onPairInfoChange
}: PoolInputProps) {
  const { loading: poolLoading } = useUniswapV3Pool(value || undefined);
  const savedPools = useMemo(() => POPULAR_POOLS, []);

  const badge = poolLoading 
    ? <span className={styles.badge}>Loading...</span>
    : value 
      ? <PoolPairInfo poolAddress={value} onPairInfoChange={onPairInfoChange} />
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
        savedValues={savedPools}
      />
    </div>
  );
}