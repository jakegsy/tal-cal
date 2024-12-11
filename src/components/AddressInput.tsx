import { X } from 'lucide-react';
import { isValidEthereumAddress } from '../utils/validation';

const styles = {
  container: 'relative',
  labelContainer: 'flex justify-between items-center mb-2',
  label: 'block text-sm font-medium text-gray-700',
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
}

export function AddressInput({ 
  value, 
  onChange, 
  placeholder = "Enter address",
  label,
  hideLabel = false,
  error,
  validate
}: AddressInputProps) {
  const isValid = !value || (validate ? validate(value) : isValidEthereumAddress(value));

  return (
    <div className={styles.container}>
      {!hideLabel && label && (
        <div className={styles.labelContainer}>
          <label className={styles.label}>{label}</label>
        </div>
      )}
      <div className={styles.container}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${styles.input.base} ${isValid ? styles.input.valid : styles.input.invalid}`}
        />
        {value && (
          <button 
            onClick={() => onChange('')}
            className={styles.clearButton}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {value && !isValid && (
        <p className={styles.errorMessage}>
          Please enter a valid Ethereum address
        </p>
      )}
      {error && (
        <p className={styles.errorMessage}>{error}</p>
      )}
    </div>
  );
}