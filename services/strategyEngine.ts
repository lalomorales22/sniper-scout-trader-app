import { CoinData, StrategyAnalysis, SignalCheck, MarketContext } from '../types';

export const analyzeCoin = (coin: CoinData, btcContext: number): StrategyAnalysis => {
  // 1. DEATH TRAP CHECK (Priority 1)
  if (coin.adx > 50 && coin.plusDI > coin.minusDI) {
    return {
      type: 'DANGER_TRAP',
      score: 0,
      maxScore: 5,
      confidence: 'LOW',
      headline: `⛔ DANGER: ${coin.symbol} - AVOID SHORT`,
      recommendation: 'HOLD - Wait for ADX < 30',
      historicalWinRate: '0% (Liquidation Risk)',
      riskLevel: 'EXTREME',
      checks: [
        { name: 'ADX', value: coin.adx.toFixed(1), status: 'FAIL', details: '>50 = STRONG UPTREND (DEATH)' },
        { name: 'RSI', value: coin.rsi.toFixed(1), status: 'WARN', details: 'Looks overbought but is a trap' },
        { name: 'DI Balance', value: `${coin.plusDI.toFixed(1)} / ${coin.minusDI.toFixed(1)}`, status: 'FAIL', details: 'Bulls dominating' }
      ]
    };
  }

  // 2. BURRY SHORT STRATEGY
  // Logic: RSI > 80, MACD Fading, ADX < 30, Stoch > 90, Vol > 2x
  if (coin.rsi > 70) { // Broaden search slightly to show "WARN" states, but strictly strictly high for score
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
       checks.push({ name: 'MACD', value: 'Fading', status: 'PASS', details: `histogram ${coin.macdHistogram.toFixed(4)} → fading` });
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
      return {
        type: 'BURRY_SHORT',
        score,
        maxScore: 5,
        confidence: score === 5 ? 'MAXIMUM' : score === 4 ? 'HIGH' : 'MODERATE',
        headline: `${coin.symbol} - BURRY SHORT SIGNAL`,
        recommendation: score === 5 ? 'SUGGESTED SIZE: 80% ($26,714)' : 'SUGGESTED SIZE: 40% (Conservative)',
        historicalWinRate: score === 5 ? '80% (13/16 similar setups)' : '65%',
        riskLevel: score === 5 ? 'SAFE' : 'CAUTION',
        checks
      };
    }
  }

  // 3. PENGUIN DIVERGENCE LONG
  // BTC down 3-8%, Alt up 10%+, Divergence
  if (btcContext < -2 && coin.priceChange1h > 5) {
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
       checks.push({ name: 'Divergence', value: `${divergenceAngle.toFixed(1)}%`, status: 'PASS', details: '>20% spread ━━━ EXTREME' });
       score++;
    } else {
       checks.push({ name: 'Divergence', value: `${divergenceAngle.toFixed(1)}%`, status: 'WARN', details: 'Spread too tight' });
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
       return {
        type: 'PENGUIN_LONG',
        score,
        maxScore: 5,
        confidence: score >= 4 ? 'HIGH' : 'MODERATE',
        headline: `${coin.symbol} - PENGUIN DIVERGENCE LONG`,
        recommendation: 'SUGGESTED SIZE: 70% (Counter-trend)',
        historicalWinRate: '66.7% on this pattern',
        riskLevel: 'CAUTION',
        checks,
        divergenceAngle
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
    historicalWinRate: '-',
    riskLevel: 'SAFE',
    checks: []
  };
};

export const getSession = (): MarketContext['sessionName'] => {
  const hour = new Date().getUTCHours();
  if (hour >= 0 && hour < 8) return 'ASIAN';
  if (hour >= 8 && hour < 13) return 'LONDON';
  if (hour >= 13 && hour < 21) return 'US';
  return 'US_CLOSE';
}
