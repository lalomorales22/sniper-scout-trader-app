const axios = require('axios');
const db = require('./database');

// Configuration
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const COIN_IDS = 'bitcoin,ethereum,solana,binancecoin,ripple,cardano,dogecoin,avalanche-2,chainlink,polkadot,matic-network';

// Symbol Mapping
const SYMBOLS = {
  'bitcoin': 'BTC',
  'ethereum': 'ETH',
  'solana': 'SOL',
  'binancecoin': 'BNB',
  'ripple': 'XRP',
  'cardano': 'ADA',
  'dogecoin': 'DOGE',
  'avalanche-2': 'AVAX',
  'chainlink': 'LINK',
  'polkadot': 'DOT',
  'matic-network': 'MATIC'
};

// In-memory Cache
let latestData = {};
let lastUpdate = 0;

// --- TECHNICAL ANALYSIS HELPERS ---

// Calculate RSI from an array of prices
const calculateRSI = (prices, period = 14) => {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

// Calculate MACD (12, 26, 9)
const calculateMACD = (prices) => {
    if (prices.length < 26) return { histogram: 0, prevHistogram: 0 };

    const ema = (data, period) => {
        const k = 2 / (period + 1);
        let emaVal = data[0];
        for (let i = 1; i < data.length; i++) {
            emaVal = (data[i] * k) + (emaVal * (1 - k));
        }
        return emaVal;
    };

    // Simple MACD implementation (Calculation on last slice)
    // In production, you'd run this over the whole array, here we just approx the snapshot
    const ema12 = ema(prices.slice(-12), 12);
    const ema26 = ema(prices.slice(-26), 26);
    const macdLine = ema12 - ema26;
    
    // Signal line is EMA9 of MACD Line. 
    // Since we don't have historical MACD lines stored easily here without more complex caching,
    // we will approximate the "Signal" using the slope of the MACD line over the last 3 data points
    // to determine the histogram. 
    
    // Simplified for "Live Feed" visualization purposes:
    // If price is trending up sharply vs long term avg, Histogram is positive.
    const histogram = (ema12 - ema26) * 0.5; // Approx scaling
    
    return {
        histogram,
        prevHistogram: histogram * 0.9 // Simulated previous for trend direction
    };
};

// Proxies ADX based on Volatility/Trend consistency
const calculateADX = (prices) => {
    // If standard deviation of recent changes is high and unidirectional, ADX is high
    if (prices.length < 14) return 25;
    const recent = prices.slice(-14);
    const changes = recent.map((p, i) => i === 0 ? 0 : p - recent[i-1]).slice(1);
    
    const upMoves = changes.filter(c => c > 0).length;
    const downMoves = changes.filter(c => c < 0).length;
    
    const trendStrength = Math.abs(upMoves - downMoves) / changes.length; // 0 to 1
    return 15 + (trendStrength * 50); // Maps to 15-65 range
};

// --- CORE LOGIC ---

const updateMarketData = async () => {
  try {
    // Fetch Markets with Sparkline (7 days hourly data)
    // Note: Sparkline=true adds ~168 data points per coin
    const url = `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${COIN_IDS}&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=1h`;
    
    const response = await axios.get(url);
    const rawData = response.data;
    
    const processedData = {};

    rawData.forEach(coin => {
      const symbol = SYMBOLS[coin.id] || coin.symbol.toUpperCase();
      const prices = coin.sparkline_in_7d.price;
      
      // Calculate Technicals
      const rsi = calculateRSI(prices);
      const { histogram, prevHistogram } = calculateMACD(prices);
      const adx = calculateADX(prices);
      
      // Calculate Stoch (Proxy using High/Low of last 50 hours)
      const recentPrices = prices.slice(-50);
      const high = Math.max(...recentPrices);
      const low = Math.min(...recentPrices);
      const current = coin.current_price;
      const stochK = ((current - low) / (high - low)) * 100;
      
      // Approximate Volume Ratio (Current Vol / Est Avg Vol)
      // CoinGecko gives 24h Vol. We can compare it to Market Cap or just randomize slightly around 1.0 for the "Game" feel if no historical vol provided
      const volumeRatio = (Math.random() * 2) + 0.5; // Real volume avg requires historical volume data endpoint

      // DI +/- (Simulated based on trend for visual completeness)
      const trendDir = prices[prices.length - 1] - prices[prices.length - 10];
      const plusDI = trendDir > 0 ? 30 : 15;
      const minusDI = trendDir < 0 ? 30 : 15;

      processedData[symbol] = {
        symbol,
        price: coin.current_price,
        priceChange1h: coin.price_change_percentage_1h_in_currency || 0,
        rsi,
        macdHistogram: histogram,
        macdPrevHistogram: prevHistogram,
        adx,
        plusDI,
        minusDI,
        stochasticK: stochK,
        volumeRatio,
        timestamp: Date.now()
      };

      // Log Signals if Significant
      if (rsi > 80 || rsi < 20) {
         db.logSignal({
            timestamp: Date.now(),
            symbol,
            strategy: rsi > 80 ? 'OVERBOUGHT' : 'OVERSOLD',
            score: 4,
            price: coin.current_price,
            meta: { rsi, adx }
         });
      }
    });

    latestData = processedData;
    lastUpdate = Date.now();
    console.log(`[${new Date().toISOString()}] Market Data Updated: ${Object.keys(latestData).length} coins processed.`);

  } catch (error) {
    console.error('Failed to fetch market data:', error.message);
  }
};

const startPolling = () => {
  updateMarketData(); // Initial fetch
  setInterval(updateMarketData, 60 * 1000); // Poll every 60s
};

module.exports = {
  startPolling,
  getLatestData: () => latestData,
  getLastUpdateTimestamp: () => lastUpdate,
  getTrackedCount: () => Object.keys(latestData).length
};