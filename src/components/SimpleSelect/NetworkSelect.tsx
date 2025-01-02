import { Network } from 'ethers';
import { NetworkOption } from '../../types';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

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
  {
    id: 'polygon',
    name: 'Polygon',
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/matic.png',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/arb.png',
  },
  {
    id: 'optimism',
    name: 'Optimism',
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/op.png',
  }
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
  const [isOpen, setIsOpen] = useState(false)

  

  return (
    <div className="relative">
      <div className='flex flex-row space-x-2 cursor-pointer p-2 border border-gray-200 rounded-lg' onClick={() => setIsOpen(!isOpen)}>
        { loadIcon(value) }
        <span>
          { value && value !== 'Select Network'? 
            <>{ loadSelectedNetwork(value)}</>
          : <>Select</> }
        </span>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      </div> 
      { isOpen && (
        <div className='absolute rounded-md shadow-lg border border-gray-200 z-50 w-full bg-white'>
          { networks.map((network) => {
            return (
              <div key={network.id} 
              className={`flex items-center px-3 py-2 cursor-pointer hover:bg-blue-100 ${network.id === value ? "bg-blue-100" : ""} space-x-2`}
              onClick={() => {
                onChange(network.id)
                setIsOpen(false)
              }}>
                <img 
                src={network.icon}
                alt={network.name}
                className='h-5 w-5' />
                <span className='truncate'>{network.name}</span>
              </div>
            )
          })}
        </div>
      )}
      
      
    </div>
  );
}