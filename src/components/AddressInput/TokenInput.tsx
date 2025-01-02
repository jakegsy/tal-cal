import { useTokenInfo } from '../../hooks/useTokenData';
import { AddressInput } from './AddressInput';
import { isValidEthereumAddress } from '../../utils/validation';
import { useMemo } from 'react';
import { X } from 'lucide-react';
import { TokenInfo } from '../../services/ethereum';

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
  poolCoins?: TokenInfo[];
}

export function TokenInput({
  value,
  onChange,
  label = "Token",
  isNativeLiquidity = false,
  hideLabel = false,
  poolCoins
}: TokenInputProps) {
  const shouldFetchTokenInfo = value && isValidEthereumAddress(value);
  const { data: tokenInfo, isLoading } = useTokenInfo(shouldFetchTokenInfo ? value : undefined);

  // Common tokens that can be pre-populated
  const savedTokens = useMemo(() => [
    {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      label: "WETH",
    },
    {
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      label: "WBTC",
    },
    {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      label: "USDC",
    },
    {
      address: "0x7122985656e38BDC0302Db86685bb972b145bD3C",
      label: 'STONE'
    }
    // Add more common tokens as needed
  ], []);

  const validateToken = (address: string) => {
    return isValidEthereumAddress(address);
  };

  const error = value && !isValidEthereumAddress(value)
    ? "Only valid Ethereum addresses are allowed"
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
  }, [value, isLoading, tokenInfo]);

  return (
    <AddressInput
      value={value}
      onChange={onChange}
      label={label}
      hideLabel={hideLabel}
      validate={validateToken}
      error={error}
      badge={badge}
      savedValues={savedTokens}
      isLoading={isLoading}
      clearIcon={<X size={16} />}
      poolCoins={poolCoins}
    />
  );
}