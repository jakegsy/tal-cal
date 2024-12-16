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
}

export function AddressInput({ 
  value, 
  onChange, 
  placeholder = "Enter address",
  label,
  hideLabel = false,
  error,
  validate,
  badge
}: AddressInputProps) {
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
        <div className="relative flex">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${styles.input.base} ${
              errorMessage ? styles.input.invalid : styles.input.valid
            }`}
          />
          {value && (
            <button
              onClick={() => onChange('')}
              className={styles.clearButton}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <p className={styles.errorMessage}>{errorMessage}</p>
      )}
    </div>
  );
}