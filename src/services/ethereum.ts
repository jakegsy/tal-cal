import { ethers } from 'ethers';
import { ERC20_ABI } from '../contracts/erc20';

const DEFAULT_RPC_URL = 'https://eth.llamarpc.com';

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

class EthereumService {
  private provider: ethers.JsonRpcProvider;
  private tokenCache: Map<string, TokenInfo>;

  constructor() {
    const rpcUrl = import.meta.env.VITE_ETHEREUM_RPC_URL || DEFAULT_RPC_URL;
    this.provider = new ethers.JsonRpcProvider(DEFAULT_RPC_URL);
    this.tokenCache = new Map();
    console.log(`Ethereum service initialized with RPC URL: ${rpcUrl}`);
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    try {
      // Check cache first
      const cached = this.tokenCache.get(tokenAddress.toLowerCase());
      if (cached) return cached;

      // // Verify it's a contract first
      // const isContract = await this.isContract(tokenAddress);
      // if (!isContract) {
      //   throw new Error(`Address ${tokenAddress} is not a contract`);
      // }

      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);

      // Use Promise.allSettled to handle potential failures gracefully
      const [nameResult, symbolResult, decimalsResult] = await Promise.allSettled([
        contract.name(),
        contract.symbol(),
        contract.decimals()
      ]);

      // Validate each result and throw appropriate errors
      if (nameResult.status === 'rejected') {
        throw new Error(`Failed to get token name: ${nameResult.reason}`);
      }
      if (symbolResult.status === 'rejected') {
        throw new Error(`Failed to get token symbol: ${symbolResult.reason}`);
      }
      if (decimalsResult.status === 'rejected') {
        throw new Error(`Failed to get token decimals: ${decimalsResult.reason}`);
      }

      const tokenInfo: TokenInfo = {
        address: tokenAddress,
        name: nameResult.value,
        symbol: symbolResult.value,
        decimals: decimalsResult.value
      };

      // Cache the result
      this.tokenCache.set(tokenAddress.toLowerCase(), tokenInfo);
      
      return tokenInfo;
    } catch (error) {
      console.error(`Error fetching token info for ${tokenAddress}:`, error);
      throw error instanceof Error ? error : new Error(`Unknown error fetching token info for ${tokenAddress}`);
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