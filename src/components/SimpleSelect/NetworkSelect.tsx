import { Network } from 'ethers';
import { NetworkOption } from '../../types';
import { ChevronDown } from 'lucide-react';

interface NetworkSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const networks: NetworkOption[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/eth.png',
  },
];

const loadIcon = (value) => {
  const selectedNetwork = 
  value && value !== 'Select Network'?
  networks.find((network) => network.id.toLowerCase() === value.toLowerCase()):
  null
  return (
    <div>
      <img src={ selectedNetwork?.icon } className='w-5 h-5'></img>
    </div>
  )
}

const loadSelectedNetwork = (value) => {
  var selectedNetwork = networks.find(network => network.id === value)

  return selectedNetwork.name
}


export function NetworkSelect({ value, onChange }: NetworkSelectProps) {
  return (
    <div className="relative">
      <div className='flex flex-row space-x-2'>
        { loadIcon(value) }
        <span>
          { value && value !== 'Select Network'? 
            <>{ loadSelectedNetwork(value)}</>
          : <>Select</> }
        </span>
       
      </div>
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white rounded-lg border border-gray-200 px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {networks.map((network) => (
          <option key={network.id} value={network.id}>
            {network.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
    </div>
  );
}