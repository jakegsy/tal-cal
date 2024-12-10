export interface TokenData {
  id: string;
  symbol: string;
  name: string;
  decimals: string;
  totalSupply: string;
  tradeVolume: string;
  tradeVolumeUSD: string;
  totalLiquidity: string;
}

export interface Token {
  id: string;
  symbol: string;
  name: string;
}

export interface PairData {
  id: string;
  token0: Token;
  token1: Token;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  reserveUSD: string;
  volumeUSD: string;
}