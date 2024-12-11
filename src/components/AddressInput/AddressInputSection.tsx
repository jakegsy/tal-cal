import { TokenInput } from './TokenInput';
import { PoolInput } from './PoolInput';
import { PairInput } from './PairInput';

interface AddressInputSectionProps {
  baseToken: string;
  pairToken: string;
  liquidityType: 'uniswap_v3' | 'native';
  priceRange: number;
  onBaseTokenChange: (value: string) => void;
  onPairTokenChange: (value: string) => void;
}

export function AddressInputSection({
  baseToken,
  pairToken,
  liquidityType,
  priceRange,
  onBaseTokenChange,
  onPairTokenChange,
}: AddressInputSectionProps) {
  const isUniswapV3 = liquidityType === 'uniswap_v3';
  const isNativeLiquidity = liquidityType === 'native';

  return (
    <>
      <TokenInput
        label="Base Token:"
        value={baseToken}
        onChange={onBaseTokenChange}
        isNativeLiquidity={isNativeLiquidity}
      />

      <div className="relative">
        {isUniswapV3 ? (
          <PoolInput
            label="Pool Address:"
            value={pairToken}
            onChange={onPairTokenChange}
          />
        ) : isNativeLiquidity ? (
          <PairInput
            label="Pair Token:"
            value={pairToken}
            onChange={onPairTokenChange}
            priceRange={priceRange}
          />
        ) : (
          <TokenInput
            label="Pair Token:"
            value={pairToken}
            onChange={onPairTokenChange}
            isNativeLiquidity={false}
          />
        )}
      </div>
    </>
  );
}