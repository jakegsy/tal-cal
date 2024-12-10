export interface Token {
  symbol: string;
  icon?: string;
}

export interface NetworkOption {
  id: string;
  name: string;
  icon: string;
}

export interface LiquidityType {
  id: string;
  name: string;
}

export interface Record {
  tokenName: string;
  network: string;
  amount: string;
  liquidityType: string;
  priceRange: string;
  pairInfo?: string;
  address?: string;
}

export interface PoolInfo {
  pool: string;
  pooledBaseToken: string;
  pooledPairedToken: string;
  tvlUsd: string;
}

export interface PoolData {
  tokenName: string;
  network: string;
  amount: string;
  priceRange: string;
  liquidityType: string;
  poolAddress: string;
  poolInfo: PoolInfo;
}