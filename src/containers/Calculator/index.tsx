import { useState } from 'react';
import { NetworkSelect } from '../../components/NetworkSelect';
import { LiquidityTypeSelect } from '../../components/LiquidityTypeSelect';
import { PriceRangeSelector } from '../../components/PriceRangeSelector';
import { RecordsList } from '../RecordsList';
import { 
  DEFAULT_NETWORK, 
  DEFAULT_LIQUIDITY_TYPE, 
  DEFAULT_PRICE_RANGE,
  DEFAULT_BASE_TOKEN,
  DEFAULT_POOL_ADDRESS 
} from '../../constants/defaults';
import { TotalLiquidityDisplay } from '../../components/TotalLiquidityDisplay';
import { AddressInputSection } from '../../components/AddressInput/AddressInputSection';

export function Calculator() {
  const [network, setNetwork] = useState(DEFAULT_NETWORK);
  const [liquidityType, setLiquidityType] = useState(DEFAULT_LIQUIDITY_TYPE);
  const [baseToken, setBaseToken] = useState(DEFAULT_BASE_TOKEN);
  const [pairToken, setPairToken] = useState(
    DEFAULT_LIQUIDITY_TYPE === 'uniswap_v3' ? DEFAULT_POOL_ADDRESS : ''
  );
  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE_RANGE);

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
          />
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
              View Pool
            </button>
            <button className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">
              Add Liquidity
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">How it works?</h2>
        </div>
      </div>
    </div>
  );
}