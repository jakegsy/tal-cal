import { ExternalLink } from 'lucide-react';
import { formatAddress } from '../../utils/validation';

interface RecordCardProps {
  tokenName: string;
  network: string;
  amount: string;
  liquidityType: string;
  priceRange: string;
  pairInfo?: string;
  address?: string;
}

export function RecordCard({
  tokenName,
  network,
  amount,
  liquidityType,
  priceRange,
  pairInfo,
  address
}: RecordCardProps) {
  const handleViewPool = () => {
    if (address) {
      window.open(`https://app.uniswap.org/explore/pools/ethereum/${address}`, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <img
            src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/eth.png"
            alt={tokenName}
            className="w-6 h-6"
          />
          <div>
            <div className="font-medium">{tokenName}</div>
            <div className="text-sm text-gray-500">{network}</div>
          </div>
        </div>
        <span className="text-sm text-blue-500">{liquidityType}</span>
      </div>
      
      <div className="mb-3">
        <div className="text-2xl font-bold">{amount}</div>
        <div className="text-sm text-gray-500">TAL</div>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div>
          <div className="text-gray-500">Price Range {priceRange}</div>
          {pairInfo && <div className="text-gray-600">{pairInfo}</div>}
          {address && (
            <div className="text-gray-600 font-mono text-xs mt-1">
              {formatAddress(address)}
            </div>
          )}
        </div>
        <button 
          onClick={handleViewPool}
          className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
        >
          View Pool
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}