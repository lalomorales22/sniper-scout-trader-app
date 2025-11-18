
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
  sparkline: number[]; // 7d price history
  timestamp: number;
}

export type StrategyType = 'BURRY_SHORT' | 'PENGUIN_LONG' | 'NEUTRAL' | 'DANGER_TRAP';

export interface SignalCheck {
  name: string;
  value: string | number;
  status: 'PASS' | 'WARN' | 'FAIL' | 'NEUTRAL';
  details: string;
}

export interface HistoricalMatch {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number; // percentage
  avgPnL: number;
  similarWin: string; // e.g., "Cycle 4 ASTER: RSI 92 -> +43%"
  similarLoss: string; // e.g., "Cycle 3 DASH: ADX > 40 -> Liq"
  commonWinFactor: string;
}

export interface StrategyAnalysis {
  type: StrategyType;
  score: number;
  maxScore: number;
  confidence: 'MAXIMUM' | 'HIGH' | 'MODERATE' | 'LOW';
  checks: SignalCheck[];
  headline: string;
  recommendation: string;
  riskLevel: 'SAFE' | 'CAUTION' | 'EXTREME';
  divergenceAngle?: number; // Specific to Penguin
  historicalData?: HistoricalMatch;
  signalTimestamp: number; // When signal was detected
}

export interface MarketContext {
  btcChange: number;
  sessionName: 'ASIAN' | 'LONDON' | 'US' | 'US_CLOSE';
  portfolioHeat: number; // 0-100
}

export type CharacterProfile = 'g0d' | 'burry' | 'pnguin';

export interface UserProfileConfig {
  id: CharacterProfile;
  name: string;
  description: string;
  riskTolerance: 'AGGRESSIVE' | 'CALCULATED' | 'CONTRARIAN';
  leverageCap: number;
  preferredStrategy: StrategyType | 'ALL';
  themeColor: string;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  pnl: number; // ROI percentage
  timestamp: number;
}

export interface ActivePosition {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  sizeUsd: number;
  leverage: number;
  tpPrice: number;
  slPrice: number;
  liqPrice: number;
  ageMinutes: number;
  timestamp: number; // For PnL calc
}
