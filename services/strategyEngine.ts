
import { CoinData, StrategyAnalysis, SignalCheck, MarketContext, HistoricalMatch } from '../types';

// Simulated Historical Data Generator
const getHistoricalMatch = (type: string, score: number, adx: number): HistoricalMatch => {
  if (type === 'BURRY_SHORT') {
    if (score === 5) {
      return {
        totalMatches: 16,
        wins: 13,
        losses: 3,
        winRate: 81.3,
        avgPnL: 25,
        similarWin: 'Cycle 52 ASTER: RSI 98.04 → +36% in 0.1h',
        similarLoss: 'Cycle 3 DASH: ADX > 40 (47.96) → Liq',
        commonWinFactor: 'All wins had ADX < 30'
      };
    } else {
      return {
        totalMatches: 42,
        wins: 24,
        losses: 18,
        winRate: 57.1,
        avgPnL: 12,
        similarWin: 'Cycle 12 ETH: RSI 82 → +15%',
        similarLoss: 'Cycle 9 SOL: Vol too low → Reversal',
        commonWinFactor: 'MACD Fading explicitly'
      };
    }
  }
  // Penguin Long
  return {
    totalMatches: 22,
    wins: 15,
    losses: 7,
    winRate: 68.2,
    avgPnL: 35,
    similarWin: 'Cycle 88 SOL: Div Angle 24% → +120%',
    similarLoss: 'Cycle 44 AVAX: BTC dumped > 10% → Stop Loss',
    commonWinFactor: 'Divergence Angle > 20%'
  };
};

export const analyzeCoin = (coin: CoinData, btcContext: number): StrategyAnalysis => {
  const now = Date.now();
  
  // 1. DEATH TRAP CHECK (Priority 1)
  if (coin.adx > 50 && coin.plusDI > coin.minusDI) {
    return {
      type: 'DANGER_TRAP',
      score: 0,
      maxScore: 5,
      confidence: 'LOW',
      headline: `⛔ DANGER: ${coin.symbol} - AVOID SHORT`,
      recommendation: 'HOLD - Wait for ADX < 30',
      riskLevel: 'EXTREME',
      signalTimestamp: now,
      checks: [
        { name: 'ADX', value: coin.adx.toFixed(1), status: 'FAIL', details: '>50 = STRONG UPTREND (DEATH)' },
        { name: 'RSI', value: coin.rsi.toFixed(1), status: 'WARN', details: 'Looks overbought but is a trap' },
        { name: 'DI Balance', value: `${coin.plusDI.toFixed(1)} / ${coin.minusDI.toFixed(1)}`, status: 'FAIL', details: 'Bulls dominating' }
      ]
    };
  }

  // 2. BURRY SHORT STRATEGY
  if (coin.rsi > 70) {
    const checks: SignalCheck[] = [];
    let score = 0;

    // RSI
    if (coin.rsi > 80) {
      checks.push({ name: 'RSI', value: coin.rsi.toFixed(2), status: 'PASS', details: '>80 threshold ━━━ EXTREME' });
      score++;
    } else {
      checks.push({ name: 'RSI', value: coin.rsi.toFixed(2), status: 'WARN', details: '76-80 is flex zone (risky)' });
    }

    // MACD
    const macdFading = coin.macdHistogram < coin.macdPrevHistogram;
    if (macdFading && coin.macdHistogram > 0) {
       checks.push({ name: 'MACD', value: 'Fading', status: 'PASS', details: `hist ${coin.macdHistogram.toFixed(4)} → fading` });
       score++;
    } else {
       checks.push({ name: 'MACD', value: 'Expanding', status: 'NEUTRAL', details: 'Momentum still increasing' });
    }

    // ADX
    if (coin.adx < 30) {
       checks.push({ name: 'ADX', value: coin.adx.toFixed(2), status: 'PASS', details: '<30 = weak trend ━━━ SAFE' });
       score++;
    } else {
       checks.push({ name: 'ADX', value: coin.adx.toFixed(2), status: 'WARN', details: '>30 trend risk' });
    }

    // Stochastic
    if (coin.stochasticK > 90) {
       checks.push({ name: 'Stochastic', value: coin.stochasticK.toFixed(1), status: 'PASS', details: '>90 ━━━ PEAK' });
       score++;
    } else {
       checks.push({ name: 'Stochastic', value: coin.stochasticK.toFixed(1), status: 'NEUTRAL', details: '<90' });
    }

    // Volume
    if (coin.volumeRatio > 2.0) {
      checks.push({ name: 'Volume', value: `${coin.volumeRatio.toFixed(1)}x`, status: 'PASS', details: 'Spike > 2x avg' });
      score++;
    } else {
      checks.push({ name: 'Volume', value: `${coin.volumeRatio.toFixed(1)}x`, status: 'NEUTRAL', details: 'Normal volume' });
    }

    // BTC Context
    const btcStatus = btcContext < -1 ? 'DUMPING' : btcContext > 1 ? 'PUMPING' : 'SIDEWAYS';
    checks.push({
      name: 'BTC Context',
      value: `${btcContext > 0 ? '+' : ''}${btcContext.toFixed(2)}%`,
      status: btcStatus === 'PUMPING' ? 'WARN' : 'PASS',
      details: btcStatus === 'PUMPING' ? 'Caution (May invalidate short)' : 'Neutral/Dumping (Safe)'
    });

    if (score >= 3) {
      const histData = getHistoricalMatch('BURRY_SHORT', score, coin.adx);
      return {
        type: 'BURRY_SHORT',
        score,
        maxScore: 5,
        confidence: score === 5 ? 'MAXIMUM' : score === 4 ? 'HIGH' : 'MODERATE',
        headline: `${coin.symbol} - BURRY SHORT SIGNAL`,
        recommendation: score === 5 ? 'SIZE: 80% | LEV: 50x' : 'SIZE: 40% | LEV: 20x',
        riskLevel: score === 5 ? 'SAFE' : 'CAUTION',
        checks,
        historicalData: histData,
        signalTimestamp: now
      };
    }
  }

  // 3. PENGUIN DIVERGENCE LONG
  if (btcContext < -1.5 && coin.priceChange1h > 2) {
    const checks: SignalCheck[] = [];
    let score = 0;

    const divergenceAngle = Math.abs(btcContext) + Math.abs(coin.priceChange1h);

    // BTC Dump Check
    if (btcContext >= -8 && btcContext <= -3) {
       checks.push({ name: 'BTC', value: `${btcContext.toFixed(1)}%`, status: 'PASS', details: 'Dump threshold -3% to -8%' });
       score++;
    } else {
       checks.push({ name: 'BTC', value: `${btcContext.toFixed(1)}%`, status: 'WARN', details: 'Outside ideal dump zone' });
    }

    // Alt Pump Check
    if (coin.priceChange1h > 10) {
       checks.push({ name: 'Alt Performance', value: `+${coin.priceChange1h.toFixed(1)}%`, status: 'PASS', details: 'Alt pump >10% ━━━ FEAR' });
       score++;
    } else {
       checks.push({ name: 'Alt Performance', value: `+${coin.priceChange1h.toFixed(1)}%`, status: 'NEUTRAL', details: 'Strength building' });
    }

    // Divergence Angle
    if (divergenceAngle > 20) {
       checks.push({ name: 'Divergence Angle', value: `${divergenceAngle.toFixed(1)}%`, status: 'PASS', details: '>20% spread ━━━ EXTREME' });
       score++;
    } else {
       checks.push({ name: 'Divergence Angle', value: `${divergenceAngle.toFixed(1)}%`, status: 'WARN', details: 'Spread too tight' });
    }

    // Volume
    if (coin.volumeRatio > 3.0) {
        checks.push({ name: 'Volume', value: `${coin.volumeRatio.toFixed(1)}x`, status: 'PASS', details: 'Rotation confirmed' });
        score++;
    }

    // RSI (Momentum check for long)
    if (coin.rsi >= 70 && coin.rsi <= 85) {
        checks.push({ name: 'RSI', value: coin.rsi.toFixed(1), status: 'PASS', details: '70-85 zone ━━━ MOMENTUM' });
        score++;
    }

    if (score >= 3) {
       const histData = getHistoricalMatch('PENGUIN_LONG', score, coin.adx);
       return {
        type: 'PENGUIN_LONG',
        score,
        maxScore: 5,
        confidence: score >= 4 ? 'HIGH' : 'MODERATE',
        headline: `${coin.symbol} - PENGUIN DIVERGENCE LONG`,
        recommendation: 'SIZE: 70% | LEV: 40x',
        riskLevel: 'CAUTION',
        checks,
        divergenceAngle,
        historicalData: histData,
        signalTimestamp: now
       };
    }
  }

  return {
    type: 'NEUTRAL',
    score: 0,
    maxScore: 0,
    confidence: 'LOW',
    headline: 'SCANNING MARKETS...',
    recommendation: 'WAIT',
    riskLevel: 'SAFE',
    checks: [],
    signalTimestamp: now
  };
};

export const getSession = (): MarketContext['sessionName'] => {
  const hour = new Date().getUTCHours();
  if (hour >= 0 && hour < 8) return 'ASIAN';
  if (hour >= 8 && hour < 13) return 'LONDON';
  if (hour >= 13 && hour < 21) return 'US';
  return 'US_CLOSE';
};

export const getSessionBias = (session: string) => {
  switch (session) {
    case 'US': return 'HIGH VOL: 13.5% avg move. Strategy: Overbought Shorts.';
    case 'ASIAN': return 'LOW VOL: 8.5% avg move. Strategy: Rangebound.';
    case 'LONDON': return 'MED VOL: Breakout setups preferred.';
    default: return 'Settling period. Reduce size.';
  }
};
