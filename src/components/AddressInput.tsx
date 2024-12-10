import { X } from 'lucide-react';
import { TokenInfo } from './TokenInfo';
import { isValidEthereumAddress } from '../utils/validation';
import { NATIVE_QUOTE_TOKENS } from '../constants/tokens';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  isNativeLiquidity?: boolean;
  showTokenInfo?: boolean;
  hideLabel?: boolean;
}

export function AddressInput({ 
  value, 
  onChange, 
  placeholder, 
  label,
  isNativeLiquidity,
  showTokenInfo = true,
  hideLabel = false,
}: AddressInputProps) {
  const isValid = !value || isValidEthereumAddress(value);
  const displayTokenInfo = showTokenInfo && isValid && value;

  const isValidQuoteToken = !isNativeLiquidity || 
    NATIVE_QUOTE_TOKENS.some(token => 
      token.address.toLowerCase() === value.toLowerCase()
    );

  const handleChange = (newValue: string) => {
    if (!isNativeLiquidity || !newValue || NATIVE_QUOTE_TOKENS.some(token => 
      token.address.toLowerCase() === newValue.toLowerCase()
    )) {
      onChange(newValue);
    }
  };

  return (
    <div className="relative">
      {!hideLabel && label && (
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          {displayTokenInfo && <TokenInfo address={value} />}
        </div>
      )}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 pr-8 font-mono text-sm
            ${isValid && isValidQuoteToken
              ? 'border-gray-200 focus:ring-blue-500' 
              : 'border-red-300 focus:ring-red-500'
            }
          `}
        />
        {value && (
          <button 
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {value && !isValid && (
        <p className="mt-1 text-sm text-red-500">
          Please enter a valid Ethereum address
        </p>
      )}
      {isNativeLiquidity && value && isValid && !isValidQuoteToken && (
        <p className="mt-1 text-sm text-red-500">
          Only USDC, USDT, WETH, and WBTC are supported for Native Liquidity
        </p>
      )}
    </div>
  );
}