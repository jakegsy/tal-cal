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
    address: "0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36",
    label: "USDC/ETH 1%",
  },
  {
    address: "0x11b815efB8f581194ae79006d24E0d814B7697F6",
    label: "USDT/ETH 0.3%",
  },
  {
    address: "0xCBCdF9626bC03E24f779434178A73a0B4bad62eD",
    label: "WBTC/ETH 0.3%",
  },
];

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
  const { loading: poolLoading } = useUniswapV3Pool(value || undefined);
  const savedPools = useMemo(() => POPULAR_POOLS, []);

  const badge = poolLoading 
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
        savedValues={savedPools}
      />
    </div>
  );
}