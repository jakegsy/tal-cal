import { OrderbookEntry, OrderLevel, ValidatedOrderbookEntry } from '../types/api';
import { NATIVE_QUOTE_TOKENS } from '../constants/tokens';

export function parseOrderbookLevels(levels: [number, number][]): OrderLevel[] {
  return levels.map(([price, amount]) => ({
    price,
    amount
  }));
}

export function calculateTotalLiquidity(levels: OrderLevel[]): number {
  return levels.reduce((total, level) => total + (level.price * level.amount), 0);
}

export function validateOrderbookEntry(entry: OrderbookEntry): ValidatedOrderbookEntry {
  const validatedLevels = parseOrderbookLevels(entry.levels);
  const totalLiquidity = calculateTotalLiquidity(validatedLevels);

  return {
    ...entry,
    validatedLevels,
    totalLiquidity
  };
}

export function calculateSelectedLiquidity(
  orderbook: OrderbookEntry[],
  baseAddress: string,
  priceRangePercent: number = 10
): number {
  // Normalize base address for comparison
  const normalizedBaseAddress = baseAddress.toLowerCase();
  const nativeQuoteAddresses = NATIVE_QUOTE_TOKENS.map(token => 
    token.address.toLowerCase()
  );

  // Filter orderbook entries where:
  // 1. The token appears as base
  // 2. The quote token is one of the native quote tokens
  const relevantEntries = orderbook.filter(entry =>
    entry.base_address.toLowerCase() === normalizedBaseAddress &&
    nativeQuoteAddresses.includes(entry.quote_address.toLowerCase())
  );

  if (relevantEntries.length === 0) {
    return 0;
  }

  // Group entries by quote token to avoid double counting
  const quoteTokenGroups = new Map<string, OrderbookEntry[]>();
  
  for (const entry of relevantEntries) {
    const quoteAddress = entry.quote_address.toLowerCase();
    const existingGroup = quoteTokenGroups.get(quoteAddress) || [];
    quoteTokenGroups.set(quoteAddress, [...existingGroup, entry]);
  }

  let totalLiquidity = 0;

  // Calculate liquidity for each quote token group
  for (const [quoteAddress, entries] of quoteTokenGroups) {
    // Skip if not a native quote token
    if (!nativeQuoteAddresses.includes(quoteAddress)) continue;

    const pairLiquidity = entries.reduce((sum, entry) => {
      const validatedEntry = validateOrderbookEntry(entry);
      const levels = validatedEntry.validatedLevels;
      
      if (levels.length === 0) return sum;

      // Find mid price (using the first level as reference)
      const midPrice = levels[0].price;
      const rangeFactor = priceRangePercent / 100;
      const lowerBound = midPrice * (1 - rangeFactor);
      const upperBound = midPrice * (1 + rangeFactor);

      // Sum liquidity within price range
      const liquidityInRange = levels.reduce((levelSum, level) => {
        if (level.price >= lowerBound && level.price <= upperBound) {
          return levelSum + (level.price * level.amount);
        }
        return levelSum;
      }, 0);

      return sum + liquidityInRange;
    }, 0);

    totalLiquidity += pairLiquidity;
  }

  return totalLiquidity;
}

export function calculateTokenPairLiquidity(
  orderbook: OrderbookEntry[],
  baseAddress: string,
  quoteAddress: string,
  priceRangePercent: number = 10
): number {
  // Normalize addresses to lowercase for comparison
  const normalizedBaseAddress = baseAddress.toLowerCase();
  const normalizedQuoteAddress = quoteAddress.toLowerCase();

  // Filter orderbook entries for the specific token pair
  const relevantEntries = orderbook.filter(entry => {
    const matchesBase = entry.base_address.toLowerCase() === normalizedBaseAddress;
    const matchesQuote = entry.quote_address.toLowerCase() === normalizedQuoteAddress;
    return matchesBase && matchesQuote;
  });

  if (relevantEntries.length === 0) {
    return 0;
  }

  let totalLiquidity = 0;

  for (const entry of relevantEntries) {
    const validatedEntry = validateOrderbookEntry(entry);
    
    // Calculate price range boundaries
    const levels = validatedEntry.validatedLevels;
    if (levels.length === 0) continue;

    // Find mid price (using the first level as reference)
    const midPrice = levels[0].price;
    const rangeFactor = priceRangePercent / 100;
    const lowerBound = midPrice * (1 - rangeFactor);
    const upperBound = midPrice * (1 + rangeFactor);

    // Sum liquidity within price range
    const liquidityInRange = levels.reduce((sum, level) => {
      if (level.price >= lowerBound && level.price <= upperBound) {
        return sum + (level.price * level.amount);
      }
      return sum;
    }, 0);

    totalLiquidity += liquidityInRange;
  }

  return totalLiquidity;
}

export function calculateTokenLiquidity(
  orderbook: OrderbookEntry[],
  baseAddress: string,
  priceRangePercent: number = 10
): number {
  return calculateSelectedLiquidity(orderbook, baseAddress, priceRangePercent);
}

export function formatLiquidity(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function parsePriceRangePercent(priceRange: string): number {
  const cleanedRange = priceRange.replace('%', '');
  const parsedValue = parseFloat(cleanedRange);
  return isNaN(parsedValue) ? 0 : parsedValue;
}