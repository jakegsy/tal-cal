import { TokenInput } from './TokenInput';
import { PoolInput } from './PoolInput';
import { PairInput } from './PairInput';
import { useState } from 'react';
import { TokenInfo } from '../../services/ethereum';

interface AddressInputSectionProps {
  baseToken: string;
  pairToken: string;
  liquidityType: 'uniswap_v3' | 'native';
  priceRange: number;
  onBaseTokenChange: (value: string) => void;
  onPairTokenChange: (value: string) => void;
  onPairInfoChange?: (pairInfo: string) => void;
}

export function AddressInputSection({
  baseToken,
  pairToken,
  liquidityType,
  priceRange,
  onBaseTokenChange,
  onPairTokenChange,
  onPairInfoChange,
}: AddressInputSectionProps) {
  const [poolCoins, setPoolCoins] = useState<TokenInfo[]>([]);
  const isUniswapV3 = liquidityType === 'uniswap_v3';
  const isNativeLiquidity = liquidityType === 'native';

  console.log('poolCoins:', poolCoins)

  return (
    <>
      <TokenInput
        label="Base Token:"
        value={baseToken}
        onChange={onBaseTokenChange}
        isNativeLiquidity={isNativeLiquidity}
        poolCoins={poolCoins}
      />

      <div className="relative">
        {isUniswapV3 ? (
          <PoolInput
            label="Pool Address:"
            value={pairToken}
            onChange={onPairTokenChange}
            onPairInfoChange={onPairInfoChange}
            updatePoolCoins={setPoolCoins}
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