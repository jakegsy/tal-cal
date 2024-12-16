import { useTokenInfo } from '../../hooks/useTokenData';
import { AddressInput } from './AddressInput';
import { isValidEthereumAddress } from '../../utils/validation';
import { useMemo } from 'react';

const styles = {
  badge: 'text-sm font-medium text-gray-500',
  tokenIcon: 'w-5 h-5 mr-2 inline-block'
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
  const shouldFetchTokenInfo = !isNativeLiquidity && value && isValidEthereumAddress(value);
  const { data: tokenInfo, isLoading } = useTokenInfo(shouldFetchTokenInfo ? value : undefined);

  const validateToken = (address: string) => {
    return isValidEthereumAddress(address);
  };

  const error = isNativeLiquidity && value && isValidEthereumAddress(value)
    ? "Only predefined tokens are supported for Native Liquidity"
    : undefined;

  const badge = useMemo(() => {
    if (!value || !isValidEthereumAddress(value)) return null;
    
    if (isLoading) {
      return <span className={styles.badge}>Loading...</span>;
    }

    if (!tokenInfo) return null;

    return (
      <span className={styles.badge}>
        <div className="flex items-center">
          {tokenInfo.icon && (
            <img 
              src={tokenInfo.icon} 
              alt={`${tokenInfo.symbol} icon`}
              className={styles.tokenIcon}
            />
          )}
          {tokenInfo.symbol}
        </div>
      </span>
    );
  }, [value, tokenInfo, isLoading]);

  return (
    <AddressInput
      value={value}
      onChange={onChange}
      validate={validateToken}
      label={label}
      hideLabel={hideLabel}
      error={error}
      badge={badge}
    />
  );
}