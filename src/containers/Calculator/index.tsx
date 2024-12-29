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
import { TOKEN_DATABASE } from '../../constants/tokens';
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
  poolPairInfo?: string;
}

const DebugCorner = () => (
  <div className="p-4 bg-gray-100 rounded-lg m-4">
    <h1 className="text-xl font-bold mb-4">DEBUG CORNER</h1>
    <div className="grid grid-cols-3 gap-4">
      {Object.entries(TOKEN_DATABASE).map(([symbol, token]) => (
        <div key={symbol} className="flex items-center space-x-2 bg-white p-2 rounded">
          <img src={token.icon} alt={symbol} className="w-6 h-6" />
          <span>{symbol}</span>
        </div>
      ))}
    </div>
  </div>
);

export function Calculator() {
  const [network, setNetwork] = useState(DEFAULT_NETWORK);
  const [liquidityType, setLiquidityType] = useState(DEFAULT_LIQUIDITY_TYPE);
  const [baseToken, setBaseToken] = useState(DEFAULT_BASE_TOKEN);
  const [pairToken, setPairToken] = useState(
    DEFAULT_LIQUIDITY_TYPE === 'uniswap_v3' ? DEFAULT_POOL_ADDRESS : ''
  );
  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE_RANGE);
  const [records, setRecords] = useState<Record[]>([]);
  const [poolPairInfo, setPoolPairInfo] = useState<string>('');
  const [liquidityValue, setLiquidityValue] = useState<string>('');
  
  // calculatorChildValue is a list of object that is passed into record list, which is then mapped into each 
  // record card


  

  useEffect(() => {
    if (poolPairInfo && records.length > 0) {
      setRecords(prev => 
        prev.map(record => 
          record.address === pairToken && record.liquidityType === 'Uniswap V3 AMM'
            ? { ...record, poolPairInfo } 
            : record
        )
      );
    }
  }, [poolPairInfo, pairToken]);

  const getTokenSymbol = (address) => {
    for (let tokens in TOKEN_DATABASE){
      if (TOKEN_DATABASE[tokens].address === address)
        return TOKEN_DATABASE[tokens].symbol
    }
    return null
  }
  
  const addRecord = (liquidityValue: string) => {
    setLiquidityValue(liquidityValue);
  };

  const createRecord = () => {
    if (!liquidityValue) return;
    
    const newRecord: Record = {
      tokenName: getTokenSymbol(baseToken) || "WETH",
      network: network,
      amount: liquidityValue,
      liquidityType: liquidityType === 'uniswap_v3' ? 'Uniswap V3 AMM' : 'Native',
      priceRange: `${priceRange}`,
      pairInfo: pairToken ? `Paired with ${pairToken}` : undefined,
      address: liquidityType === 'uniswap_v3' ? pairToken : undefined,
      poolPairInfo: liquidityType === 'native' ? 'Native' : poolPairInfo || undefined
    };
    
    setRecords(prev => [...prev, newRecord]);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      {false && <DebugCorner />}
      <div className="w-full lg:w-[65%] p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 lg:mb-8">Total Available Liquidity Calculator</h1>
        
        <div className="flex flex-col gap-4 md:gap-6 mb-6 lg:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
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
            onPairInfoChange={setPoolPairInfo}
          />
       

          
            <label className="text-sm font-medium text-gray-700">Price Range:</label>
            <PriceRangeSelector value={priceRange} onChange={setPriceRange} />
      
        </div>


        <div className="mb-6 lg:mb-8 space-y-4">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
            <TotalLiquidityDisplay 
              liquidityType={liquidityType}
              poolAddress={pairToken}
              baseToken={baseToken}
              pairToken={pairToken}
              priceRange={priceRange}
              onLiquidityCalculated={addRecord}
            />
          </div>

          <button
            onClick={createRecord}
            disabled={!liquidityValue}
            className={`w-full sm:w-auto px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-white font-medium transition-colors duration-200 ${
              liquidityValue 
                ? 'bg-blue-500 hover:bg-blue-600 shadow-sm' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Add to Records
          </button>
        </div>
      </div>

      <div className="w-full lg:w-[35%] border-t lg:border-t-0 lg:border-l border-gray-200 p-4 md:p-6 lg:p-8 bg-white">
        <h2 className="text-xl font-semibold mb-4 md:mb-6">Records</h2>
        <RecordList records={records}/>
      </div>
    </div>
  );
}