import { ethers } from 'ethers';
import { ERC20_ABI } from '../contracts/erc20';
import { TOKEN_DATABASE } from '../constants/tokens';

const DEFAULT_RPC_URL = 'https://eth.llamarpc.com';

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  icon?: string;
}

class EthereumService {
  private provider: ethers.JsonRpcProvider;
  private tokenCache: Map<string, { data: TokenInfo; timestamp: number }>;

  constructor() {
    const rpcUrl = import.meta.env.VITE_ETHEREUM_RPC_URL || DEFAULT_RPC_URL;
    this.provider = new ethers.JsonRpcProvider(DEFAULT_RPC_URL);
    this.tokenCache = new Map();
    console.log(`Ethereum service initialized with RPC URL: ${rpcUrl}`);
  }

  async getTokenBalance(tokenAddress: string, holderAddress: string): Promise<bigint> {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      return await contract.balanceOf(holderAddress);
    } catch (error) {
      console.error(`Error fetching token balance for ${tokenAddress} of holder ${holderAddress}:`, error);
      throw error instanceof Error ? error : new Error(`Unknown error fetching token balance`);
    }
  }

  private async getTokenIcon(address: string): Promise<string | undefined> {
    try {
      // Try to get icon from Trust Wallet CDN
      const checksumAddress = ethers.getAddress(address);
      const localTokenInfo = Object.values(TOKEN_DATABASE).find((token) => 
        token.address.toLowerCase() === checksumAddress.toLowerCase());
      if(localTokenInfo) return localTokenInfo.icon;
      return `https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/${checksumAddress}/logo.png`;
    } catch {
      return undefined;
    }
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    try {
      // Check cache first with a 5-minute expiry
      const cached = this.tokenCache.get(tokenAddress.toLowerCase());
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      const now = Date.now();

      if (cached && cached.timestamp && (now - cached.timestamp) < CACHE_DURATION) {
        return cached.data;
      }

      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);

      // Use Promise.allSettled to handle potential failures gracefully
      const [nameResult, symbolResult, decimalsResult] = await Promise.allSettled([
        contract.name(),
        contract.symbol(),
        contract.decimals()
      ]);

      const icon = await this.getTokenIcon(tokenAddress);

      const tokenInfo: TokenInfo = {
        address: tokenAddress,
        name: nameResult.status === 'fulfilled' ? nameResult.value : 'Unknown Token',
        symbol: symbolResult.status === 'fulfilled' ? symbolResult.value : '???',
        decimals: decimalsResult.status === 'fulfilled' ? decimalsResult.value : 18,
        icon
      };

      // Cache the result with timestamp
      this.tokenCache.set(tokenAddress.toLowerCase(), {
        data: tokenInfo,
        timestamp: now
      });

      return tokenInfo;
    } catch (error) {
      console.error(`Error fetching token info for ${tokenAddress}:`, error);
      throw error instanceof Error ? error : new Error(`Unknown error fetching token info`);
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