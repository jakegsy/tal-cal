import { isValidEthereumAddress } from '../utils/validation';
import { usePoolData } from '../services/thegraph';

export function useUniswapV3Pool(poolAddress?: string) {
  const enabled = !!poolAddress && isValidEthereumAddress(poolAddress);
  console.log('useUniswapV3Pool enabled:', enabled, 'poolAddress:', poolAddress);
  
  const { 
    data: poolInfo,
    isLoading: loading,
    error,
    isError
  } = usePoolData(enabled ? poolAddress.toLowerCase() : undefined);

  console.log('useUniswapV3Pool result:', { 
    hasPoolInfo: !!poolInfo, 
    loading, 
    hasError: !!error,
    isError 
  });

  return { 
    poolInfo: poolInfo || null,
    loading,
    error: error as Error | null
  };
}