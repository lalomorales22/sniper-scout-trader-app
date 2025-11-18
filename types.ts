export interface CoinData {
  symbol: string;
  price: number;
  priceChange1h: number; // Percentage
  rsi: number;
  macdHistogram: number;
  macdPrevHistogram: number;
  adx: number;
  plusDI: number;
  minusDI: number;
  stochasticK: number;
  volumeRatio: number; // current / avg
  timestamp: number;
}

export type StrategyType = 'BURRY_SHORT' | 'PENGUIN_LONG' | 'NEUTRAL' | 'DANGER_TRAP';

export interface SignalCheck {
  name: string;
  value: string | number;
  status: 'PASS' | 'WARN' | 'FAIL' | 'NEUTRAL';
  details: string;
}

export interface StrategyAnalysis {
  type: StrategyType;
  score: number;
  maxScore: number;
  confidence: 'MAXIMUM' | 'HIGH' | 'MODERATE' | 'LOW';
  checks: SignalCheck[];
  headline: string;
  recommendation: string;
  historicalWinRate: string;
  riskLevel: 'SAFE' | 'CAUTION' | 'EXTREME';
  divergenceAngle?: number; // Specific to Penguin
}

export interface MarketContext {
  btcChange: number;
  sessionName: 'ASIAN' | 'LONDON' | 'US' | 'US_CLOSE';
  portfolioHeat: number; // 0-100
}
