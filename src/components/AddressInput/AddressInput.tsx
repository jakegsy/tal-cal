import { X } from 'lucide-react';
import { isValidEthereumAddress } from '../../utils/validation';
import { ReactNode, useState } from 'react';

const styles = {
  container: 'relative',
  labelContainer: 'flex justify-between items-center mb-2',
  label: 'text-sm font-medium text-gray-700',
  input: {
    base: 'w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 pr-8 font-mono text-sm',
    valid: 'border-gray-200 focus:ring-blue-500',
    invalid: 'border-red-300 focus:ring-red-500'
  },
  clearButton: 'absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600',
  errorMessage: 'mt-1 text-sm text-red-500'
};

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  hideLabel?: boolean;
  error?: string;
  validate?: (address: string) => boolean;
  badge?: ReactNode;
  savedValues?: Array<{
    address: string;
    label: string;
  }>;
  isLoading?: boolean;
}

export function AddressInput({ 
  value, 
  onChange, 
  placeholder = "Enter address",
  label,
  hideLabel = false,
  error,
  validate,
  badge,
  savedValues = [],
  isLoading = false
}: AddressInputProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isValidInput = !value || (validate ? validate(value) : isValidEthereumAddress(value));
  
  const errorMessage = value && !isValidInput 
    ? "Please enter a valid Ethereum address"
    : isValidInput && error 
      ? error 
      : undefined;

  return (
    <div className={styles.container}>
      <div className={styles.labelContainer}>
        <span className={styles.label}>{!hideLabel && label}</span>
        {badge}
      </div>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${styles.input.base} ${
            errorMessage ? styles.input.invalid : styles.input.valid
          }`}
          onFocus={() => setIsDropdownOpen(true)}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className={styles.clearButton}
            type="button"
          >
            <X size={16} />
          </button>
        )}
        
        {/* Dropdown Menu */}
        {isDropdownOpen && savedValues.length > 0 && (
          <div 
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            {isLoading ? (
              <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
            ) : (
              savedValues.map((item, index) => (
                <button
                  key={index}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                  onClick={() => {
                    onChange(item.address);
                    setIsDropdownOpen(false);
                  }}
                >
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500 font-mono">{item.address}</div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {errorMessage && (
        <p className={styles.errorMessage}>{errorMessage}</p>
      )}
    </div>
  );
}