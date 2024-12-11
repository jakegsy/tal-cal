import { ethers } from 'ethers';
import { ERC20_ABI } from '../contracts/erc20';

const DEFAULT_RPC_URL = 'https://eth.llamarpc.com';

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply?: string;
}

class EthereumService {
  private provider: ethers.JsonRpcProvider;
  private tokenCache: Map<string, TokenInfo>;

  constructor() {
    const rpcUrl = import.meta.env.VITE_ETHEREUM_RPC_URL || DEFAULT_RPC_URL;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.tokenCache = new Map();
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    try {
      // Check cache first
      const cached = this.tokenCache.get(tokenAddress.toLowerCase());
      if (cached) return cached;

      // Verify it's a contract first
      const isContract = await this.isContract(tokenAddress);
      if (!isContract) {
        throw new Error('Address is not a contract');
      }

      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      
      // Use Promise.allSettled to handle potential failures gracefully
      const [nameResult, symbolResult, decimalsResult, totalSupplyResult] = await Promise.allSettled([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);

      const tokenInfo: TokenInfo = {
        address: tokenAddress,
        name: nameResult.status === 'fulfilled' ? nameResult.value : 'Unknown Token',
        symbol: symbolResult.status === 'fulfilled' ? symbolResult.value : '???',
        decimals: decimalsResult.status === 'fulfilled' ? decimalsResult.value : 18,
        totalSupply: totalSupplyResult.status === 'fulfilled' 
          ? ethers.formatUnits(totalSupplyResult.value, decimalsResult.status === 'fulfilled' ? decimalsResult.value : 18)
          : undefined
      };

      // Cache the result
      this.tokenCache.set(tokenAddress.toLowerCase(), tokenInfo);
      
      return tokenInfo;
    } catch (error) {
      console.error('Error fetching token info:', error);
      throw error;
    }
  }

  async isContract(address: string): Promise<boolean> {
    try {
      const code = await this.provider.getCode(address);
      return code !== '0x';
    } catch (error) {
      console.error('Error checking if address is contract:', error);
      return false;
    }
  }

  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  clearCache() {
    this.tokenCache.clear();
  }
}

export const ethereumService = new EthereumService();