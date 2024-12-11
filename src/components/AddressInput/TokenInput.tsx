import { useTokenInfo } from '../../hooks/useTokenInfo';
import { AddressInput } from './AddressInput';
import { NATIVE_QUOTE_TOKENS } from '../../constants/tokens';
import { isValidEthereumAddress } from '../../utils/validation';
import { useMemo } from 'react';

const styles = {
  badge: 'text-sm font-medium text-gray-500'
};

interface TokenInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  isNativeLiquidity?: boolean;
  hideLabel?: boolean;
}

export function TokenInput({
  value,
  onChange,
  label = "Token",
  isNativeLiquidity = false,
  hideLabel = false
}: TokenInputProps) {
  // Only fetch token info if:
  // 1. For non-native liquidity: when it's a valid address
  // 2. For native liquidity: never (we'll use the predefined token info)
  const shouldFetchTokenInfo = !isNativeLiquidity && value && isValidEthereumAddress(value);
  const { tokenInfo, loading } = useTokenInfo(shouldFetchTokenInfo ? value : undefined);

  const validateToken = (address: string) => {
    if (isNativeLiquidity) {
      return NATIVE_QUOTE_TOKENS.some(
        token => token.address.toLowerCase() === address.toLowerCase()
      );
    }
    return isValidEthereumAddress(address);
  };

  const error = isNativeLiquidity && value && isValidEthereumAddress(value) && !validateToken(value)
    ? "Only USDC, USDT, WETH, and WBTC are supported for Native Liquidity"
    : undefined;

  const badge = useMemo(() => {
    if (isNativeLiquidity) {
      if (!value || !isValidEthereumAddress(value)) return null;
      
      const nativeToken = NATIVE_QUOTE_TOKENS.find(
        token => token.address.toLowerCase() === value.toLowerCase()
      );
      
      if (nativeToken) {
        return <span className={styles.badge}>{`${nativeToken.name} (${nativeToken.symbol})`}</span>;
      }
      
      return null;
    }

    if (!shouldFetchTokenInfo) return null;
    
    if (loading) {
      return <span className={styles.badge}>Loading...</span>;
    }
    
    if (tokenInfo) {
      return <span className={styles.badge}>{`${tokenInfo.name} (${tokenInfo.symbol})`}</span>;
    }
    
    return null;
  }, [loading, tokenInfo, shouldFetchTokenInfo, isNativeLiquidity, value]);

  return (
    <div>
      <AddressInput
        value={value}
        onChange={onChange}
        label={label}
        badge={badge}
        hideLabel={hideLabel}
        placeholder="Enter token address"
        validate={validateToken}
        error={error}
      />
    </div>
  );
}