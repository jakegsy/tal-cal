export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  icon: string;
  decimals: number;
  network: string;
  vaultAddress?: string;
}

export const TOKEN_DATABASE: { [key: string]: TokenInfo } = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/usdc.png',
    decimals: 6,
    network: 'ethereum',
    vaultAddress: '0xFc6cED6FE2aA08a9bac61edC3FA2A91A10Ac303E'
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/usdt.png',
    decimals: 6,
    network: 'ethereum',
    vaultAddress: '0x9b705F534fc09212071bAD509Ba86a8042BDef10'
  },
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/eth.png',
    decimals: 18,
    network: 'ethereum',
    vaultAddress: '0xc41D25382889B1E484E28c4f9bbDBD6B6117e6b2'
  },
  WBTC: {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/wbtc.png',
    decimals: 8,
    network: 'ethereum',
    vaultAddress: '0xCf7834B27D60809BAe3260A3E24B47814809D68c'
  },
  ZIR: {
    symbol: 'ZIR',
    name: 'Zircuit',
    address: '0x0c2C80D8E34b1537Ce9F46665f234Ee0a584805f',
    icon: 'https://assets.coingecko.com/coins/images/33906/thumb/zircuit.png',
    decimals: 18,
    network: 'ethereum'
  }
};

// Keep existing NATIVE_QUOTE_TOKENS for backward compatibility
export const NATIVE_QUOTE_TOKENS = [
  {
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    vaultAddress: '0xFc6cED6FE2aA08a9bac61edC3FA2A91A10Ac303E',
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/usdc.png',
    decimals: 6
  },
  {
    symbol: 'USDT',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    vaultAddress: '0x9b705F534fc09212071bAD509Ba86a8042BDef10',
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/usdt.png',
    decimals: 6
  },
  {
    symbol: 'WETH',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    vaultAddress: '0xc41D25382889B1E484E28c4f9bbDBD6B6117e6b2',
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/eth.png',
    decimals: 18
  },
  {
    symbol: 'WBTC',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    vaultAddress: '0xCf7834B27D60809BAe3260A3E24B47814809D68c',
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/btc.png',
    decimals: 8
  }
] as const;
