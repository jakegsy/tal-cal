import { Token } from '../types';

export const mockTokens: Token[] = [
  { symbol: 'BTC' },
  { symbol: 'ETH' },
  { symbol: 'USDT' },
  { symbol: 'USDC' }
];

export const mockPoolTokens = {
  native: [
    { symbol: 'BTC' },
    { symbol: 'ETH' },
    { symbol: 'USDT' },
    { symbol: 'USDC' }
  ],
  uniswapV3: [
    { symbol: 'ZRC' },
    { symbol: 'USDT' }
  ]
};