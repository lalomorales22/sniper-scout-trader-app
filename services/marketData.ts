
import { CoinData } from '../types';

const API_URL = 'http://localhost:3001/api';

// Initial fallback state in case server isn't running immediately
const defaultCoins: Record<string, CoinData> = {
  BTC: { symbol: 'BTC', price: 0, priceChange1h: 0, rsi: 50, macdHistogram: 0, macdPrevHistogram: 0, adx: 25, plusDI: 0, minusDI: 0, stochasticK: 50, volumeRatio: 1, sparkline: [], timestamp: Date.now() }
};

export const getInitialCoins = () => defaultCoins;

export const fetchLiveMarketData = async (): Promise<Record<string, CoinData>> => {
  try {
    const response = await fetch(`${API_URL}/market-data`);
    if (!response.ok) {
       throw new Error('Server offline');
    }
    const data = await response.json();
    
    // If empty (server starting up), return default
    if (Object.keys(data).length === 0) return defaultCoins;
    
    return data;
  } catch (error) {
    console.warn('Fetching live data failed, using local simulation fallback if available:', error);
    // Fallback to basic local perturb if API fails (optional, keeps UI alive)
    return {}; 
  }
};
