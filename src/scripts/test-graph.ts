import { config } from 'dotenv';
import { resolve } from 'path';
import fetch from 'node-fetch';
import { graphService, sumLiquidityNet } from '../services/thegraph.js';
import { calculatePrices, calculateTicks, calculateLiquidity } from '../utils/uniswapV3.js';

// Load environment variables
const envConfig = config({ path: resolve(process.cwd(), '.env') });
if (envConfig.error) {
  throw envConfig.error;
}

// Debug: Log environment variables
console.log('Environment variables:', {
  VITE_THEGRAPH_API_KEY: process.env.VITE_THEGRAPH_API_KEY,
});

// Polyfill fetch for Node.js
globalThis.fetch = fetch as any;

// Example pool address (USDC/ETH 0.05%)
const POOL_ADDRESS = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640'.toLowerCase();

async function main() {
  try {
    console.log('Fetching pool data...');
    const poolData = await graphService.getPool(POOL_ADDRESS);
    console.log('Pool data:', JSON.stringify(poolData, null, 2));

    // Calculate price range for +5%
    const sqrtPriceX96 = Number(poolData.sqrtPrice);
    const currentTick = Number(poolData.tick);
    
    console.log('\nCalculating price range for +5%...');
    const priceRange = parseFloat("5%"); // 5%
    const prices = calculatePrices(sqrtPriceX96, true, priceRange);
    console.log('Price calculation:', JSON.stringify(prices, null, 2));

    // Calculate tick range
    console.log('\nCalculating tick range...');
    const tickSpacing = 10;
    const ticks = calculateTicks(prices.startSqrtPriceX96, prices.endSqrtPriceX96, tickSpacing);
    console.log('Tick range:', JSON.stringify(ticks, null, 2));

    // Debug price and tick calculations
    console.log('\nDebug Information:');
    console.log('Current sqrtPriceX96:', sqrtPriceX96);
    console.log('Current tick:', currentTick);
    console.log('Start price (ETH/USDC):', prices.startPrice);
    console.log('Target price (ETH/USDC):', prices.targetPrice);
    console.log('Start price (USDC/ETH):', 1 / prices.startPrice);
    console.log('Target price (USDC/ETH):', 1 / prices.targetPrice);
    console.log('Start sqrtPriceX96:', prices.startSqrtPriceX96);
    console.log('End sqrtPriceX96:', prices.endSqrtPriceX96);
    console.log('Calculated start tick:', ticks.startTick);
    console.log('Calculated end tick:', ticks.endTick);

    // Fetch ticks from Graph
    console.log('\nFetching ticks data...');
    const ticksData = await graphService.getTicks(POOL_ADDRESS, ticks.startTick, ticks.endTick);
    console.log(`Found ${ticksData.length} ticks`);
    //console.log(JSON.stringify(ticksData, null, 2));
    // Calculate cumulative liquidity at current tick and target tick
    console.log('\nLiquidity Analysis:');
    console.log('Current Tick:', ticks.startTick);
    console.log('Target Tick:', ticks.endTick);
    
    const netLiquidity = BigInt(poolData.liquidity) - sumLiquidityNet(ticksData);
    console.log('Net Liquidity:', netLiquidity.toString());
    
    const token1Amount = calculateLiquidity(
      netLiquidity,
      prices.startSqrtPriceX96,
      prices.endSqrtPriceX96,
      true // for token0 (USDC)
    );
    
    const token0Amount = calculateLiquidity(
      netLiquidity,
      prices.startSqrtPriceX96,
      prices.endSqrtPriceX96,
      false // for token1 (ETH)
    );
    
    // Adjust for decimals
    const adjustedToken0 = token0Amount / Math.pow(10, 6); // USDC has 6 decimals
    const adjustedToken1 = token1Amount / Math.pow(10, 18); // ETH has 18 decimals
    
    console.log('\nToken Amounts in Range:');
    console.log('USDC Amount:', adjustedToken0.toFixed(2));
    console.log('ETH Amount:', adjustedToken1.toFixed(8));
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
