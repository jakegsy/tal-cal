import { useState, useEffect } from 'react';
import { NetworkSelect } from '../../components/SimpleSelect/NetworkSelect';
import { LiquidityTypeSelect } from '../../components/SimpleSelect/LiquidityTypeSelect';
import { PriceRangeSelector } from '../../components/SimpleSelect/PriceRangeSelector';
import { RecordList } from '../../components/Records/RecordList';
import { 
  DEFAULT_NETWORK, 
  DEFAULT_LIQUIDITY_TYPE, 
  DEFAULT_PRICE_RANGE,
  DEFAULT_BASE_TOKEN,
  DEFAULT_POOL_ADDRESS 
} from '../../constants/defaults';
import { TotalLiquidityDisplay } from '../../components/LiquidityInfo/TotalLiquidityInfo';
import { AddressInputSection } from '../../components/AddressInput/AddressInputSection';

interface Record {
  tokenName: string;
  network: string;
  amount: string;
  liquidityType: string;
  priceRange: string;
  pairInfo?: string;
  address?: string;
}

export function Calculator() {
  const [network, setNetwork] = useState(DEFAULT_NETWORK);
  const [liquidityType, setLiquidityType] = useState(DEFAULT_LIQUIDITY_TYPE);
  const [baseToken, setBaseToken] = useState(DEFAULT_BASE_TOKEN);
  const [pairToken, setPairToken] = useState(
    DEFAULT_LIQUIDITY_TYPE === 'uniswap_v3' ? DEFAULT_POOL_ADDRESS : ''
  );
  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE_RANGE);
  const [records, setRecords] = useState<Record[]>([]);

  const addRecord = (liquidityValue: string) => {
    const newRecord: Record = {
      tokenName: baseToken || "ETH",
      network: network,
      amount: liquidityValue,
      liquidityType: liquidityType === 'uniswap_v3' ? 'Uniswap V3 AMM' : 'Native',
      priceRange: `${priceRange}`,
      pairInfo: pairToken ? `Paired with ${pairToken}` : undefined,
      address: liquidityType === 'uniswap_v3' ? pairToken : undefined
    };
    
    setRecords(prev => {
      // Check if record already exists
      const exists = prev.some(r => 
        r.tokenName === newRecord.tokenName && 
        r.address === newRecord.address &&
        r.liquidityType === newRecord.liquidityType
      );
      
      if (!exists) {
        return [...prev, newRecord];
      }
      return prev;
    });
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Total Available Liquidity Calculator</h1>
        
        <div className="flex flex-col gap-6 mb-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Network:</label>
              <NetworkSelect value={network} onChange={setNetwork} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Liquidity Type:</label>
              <LiquidityTypeSelect value={liquidityType} onChange={setLiquidityType} />
            </div>
          </div>
          
          <AddressInputSection
            baseToken={baseToken}
            pairToken={pairToken}
            liquidityType={liquidityType}
            priceRange={priceRange}
            onBaseTokenChange={setBaseToken}
            onPairTokenChange={setPairToken}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range:</label>
            <PriceRangeSelector value={priceRange} onChange={setPriceRange} />
          </div>
        </div>

        <div className="mb-8">
          <TotalLiquidityDisplay 
            liquidityType={liquidityType}
            poolAddress={pairToken}
            baseToken={baseToken}
            pairToken={pairToken}
            priceRange={priceRange}
            onLiquidityCalculated={addRecord}
          />
        </div>

        {/* <div>
          <h2 className="text-xl font-bold mb-4">How it works?</h2>
        </div> */}
      </div>
      
      
    </div>
  );
}