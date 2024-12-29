import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TOKEN_DATABASE, NATIVE_QUOTE_TOKENS } from '../../constants/tokens';
import { Circle } from 'lucide-react';
import { VaultLiquidityInfo } from '../LiquidityInfo/NativeVaultLiquidityInfo';
import { useTokenInfo } from '../../hooks/useTokenData';
import { useUniswapV3Pool } from '../../hooks/useUniswapV3Pool';

interface TokenTooltipProps {
  token: {
    symbol: string;
    address: string;
  };
  priceRange: string;
}

function TokenTooltip({ token, priceRange }: TokenTooltipProps) {
  return (
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
      <div>{token.symbol}</div>
      <VaultLiquidityInfo 
        pairToken={token.address}
        showTotalPairableValue={true}
        priceRange={parseFloat(priceRange)}
      />
    </div>
  );
}

interface RecordCardProps {
  tokenName: string;
  network: string;
  amount: string;
  liquidityType: string;
  priceRange: string;
  pairInfo?: string;
  address?: string;
  poolPairInfo?: string;
}

export function RecordCard({
  tokenName,
  network,
  amount,
  liquidityType,
  priceRange,
  pairInfo,
  address,
  poolPairInfo
}: RecordCardProps) {
  const tokenIcon = TOKEN_DATABASE[tokenName.toUpperCase()]?.icon || (
    tokenName.toUpperCase() === 'ETH' 
      ? 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/eth.png'
      : 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/generic.png'
  );

  const tokenFullName = TOKEN_DATABASE[tokenName.toUpperCase()]?.name || (
    tokenName.toUpperCase() === 'ETH' ? 'Ethereum' : tokenName
  );

  const isNative = liquidityType === 'Native';

  const handleViewPool = () => {
    if (address) {
      window.open(`https://app.uniswap.org/explore/pools/ethereum/${address}`, '_blank');
    }
  };

  const handleAddLiquidity = () => {
    window.open('https://app.uniswap.org/pools/add', '_blank');
  };

  const explorerUrl = `https://etherscan.io/token/${tokenIcon}`;

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 p-3 md:p-4 w-full sm:min-w-[400px]">
      <div className='absolute top-2 right-2 border rounded-lg px-2 text-blue-500 bg-blue-100'>
        { liquidityType }
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <img
              src={tokenIcon}
              alt={tokenName}
              className="w-5 h-5 mr-2 flex-shrink-0"
            />
            <div className="text-gray-900 font-medium text-sm md:text-base flex items-center gap-1 min-w-0">
              <span className="flex-shrink-0">{tokenName}</span>
              <span className="text-gray-500 flex-shrink-0">- {tokenFullName}</span>
            </div>
          </div>
          <div className="text-xl md:text-2xl font-bold mt-2">{amount}</div>
          <div className="text-xs md:text-sm text-gray-500">TAL</div>
          <div className="text-xs md:text-sm text-gray-500">Price Range: <span className="font-bold">{priceRange}</span></div>
          {poolPairInfo && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
              <div className="text-gray-600 text-xs md:text-sm font-medium">
                {poolPairInfo}
              </div>
              {isNative ? (
                <div className="flex -space-x-1.5 md:-space-x-2">
                  {NATIVE_QUOTE_TOKENS.map((token) => (
                    <div
                      key={token.address}
                      className="relative rounded-full bg-white border border-gray-200 p-0.5 md:p-1 group hover:z-10 transition-transform hover:scale-110"
                    >
                      {token.icon ? (
                        <>
                          <img
                            src={token.icon}
                            alt={token.symbol}
                            className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full"
                          />
                          <TokenTooltip token={token} priceRange={priceRange} />
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-gray-400" />
                          <TokenTooltip token={token} priceRange={priceRange} />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : address ? (
                <PoolPairIcons poolAddress={address} />
              ) : null}
            </div>
          )}
        </div>

        <div className="flex sm:flex-col justify-end gap-2">
          <div className="sm:pl-4 sm:border-l border-gray-200 flex sm:flex-col gap-2">
            <button
              onClick={handleViewPool}
              className="flex-1 sm:flex-none sm:w-36 px-4 py-2 rounded-lg text-gray-600 font-medium bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm text-sm border border-gray-200 flex items-center justify-center whitespace-nowrap"
            >
              View Pool
            </button>
            {isNative && (
              <button 
                onClick={handleAddLiquidity}
                className="flex-1 sm:flex-none sm:w-36 px-4 py-2 rounded-lg text-white font-medium bg-blue-500 hover:bg-blue-600 transition-colors duration-200 shadow-sm text-sm flex items-center justify-center gap-1 whitespace-nowrap"
              >
                Add Liquidity
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PoolPairIconsProps {
  poolAddress: string;
}

function PoolPairIcons({ poolAddress }: PoolPairIconsProps) {
  const { poolInfo, loading: poolLoading } = useUniswapV3Pool(poolAddress);
  const { data: token0Info, isLoading: token0Loading } = useTokenInfo(poolInfo?.token0?.id);
  const { data: token1Info, isLoading: token1Loading } = useTokenInfo(poolInfo?.token1?.id);

  const isLoading = poolLoading || token0Loading || token1Loading;

  if (isLoading || !poolInfo || !token0Info || !token1Info) {
    return (
      <div className="flex -space-x-1.5 md:-space-x-2">
        <div className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full bg-gray-200 animate-pulse" />
        <div className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex -space-x-1.5 md:-space-x-2">
      <img
        src={token0Info.icon}
        alt={token0Info.symbol}
        className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full bg-white border-2 border-white"
      />
      <img
        src={token1Info.icon}
        alt={token1Info.symbol}
        className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full bg-white border-2 border-white"
      />
    </div>
  );
}