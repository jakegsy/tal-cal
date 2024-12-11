import axios, { AxiosInstance } from 'axios';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export class CoinGeckoService {
  private api: AxiosInstance;

  constructor() {
    const apiKey = import.meta.env.VITE_COINGECKO_API_KEY;
    
    if (!apiKey) {
      console.warn('CoinGecko API key not found in environment variables');
    }

    this.api = axios.create({
      baseURL: COINGECKO_API_BASE,
      headers: {
        'x-cg-demo-api-key': apiKey
      }
    });
  }


  async getTokenPrice(address: string, platform: string = 'ethereum'): Promise<number> {
 
    try {
      const response = await this.api.get(`/coins/${platform}/contract/${address}`);
      
      if (!response.data?.market_data?.current_price?.usd) {
        throw new Error(`No price data found for token ${address}`);
      }

      const price = response.data.market_data.current_price.usd;
      
      return price;
    } catch (error) {
      console.error('Error fetching token price from CoinGecko:', error);
      throw error;
    }
  }
} 

export const coinGeckoService = new CoinGeckoService();