export interface OrderLevel {
  price: number;
  amount: number;
}

export interface OrderbookEntry {
  base_symbol: string;
  base_address: string;
  quote_symbol: string;
  quote_address: string;
  levels: [number, number][];
  side: 'bid' | 'ask';
  minimum_in_base: number;
}

export interface OrderbookResponse {
  data: OrderbookEntry[];
  timestamp?: number;
  status?: string;
}

export interface TokenBalance {
  address: string;
  balance: string;
  symbol?: string;
  decimals?: number;
}

// Helper type for parsing orderbook levels
export type OrderbookLevel = [number, number];

// Utility type for validated orderbook data
export interface ValidatedOrderbookEntry extends OrderbookEntry {
  validatedLevels: OrderLevel[];
  totalLiquidity: number;
}