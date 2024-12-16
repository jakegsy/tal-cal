import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });

// Debug: Log environment variables
console.log('Environment variables:', {
  VITE_THEGRAPH_API_KEY: process.env.VITE_THEGRAPH_API_KEY,
});
