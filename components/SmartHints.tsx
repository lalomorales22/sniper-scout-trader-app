
import React, { useState, useEffect } from 'react';
import { Lightbulb, AlertTriangle, Info } from 'lucide-react';

interface Props {
  btcChange: number;
}

const TIPS = [
  "Burry Rule: Divergence requires 3 bars of fading momentum.",
  "Penguin Rule: Never short a coin making new highs on volume.",
  "Risk Mgmt: If you feel excited, size down 50%.",
  "Trap: High ADX (>50) means trend is too strong to fade.",
  "Tip: Weekends often have lower liquidity/false moves."
];

export const SmartHints: React.FC<Props> = ({ btcChange }) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Immediate BTC Dump Warning
  if (btcChange < -1.5) {
    return (
      <div className="bg-red-950/30 border border-red-600/50 p-4 rounded-lg animate-pulse">
        <div className="flex items-center gap-2 text-red-500 font-bold text-sm mb-2 uppercase">
          <AlertTriangle size={16} />
          BTC Instability
        </div>
        <p className="text-xs text-red-200 leading-relaxed">
          Bitcoin is dropping (-{Math.abs(btcChange).toFixed(2)}%). 
          Altcoin longs are high risk. Look for "Penguin Divergence" only if BTC stabilizes.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-950/20 border border-blue-800/30 p-4 rounded-lg transition-all">
      <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-2 uppercase">
        <Lightbulb size={16} />
        Smart Hint
      </div>
      <div className="flex gap-3">
         <Info size={24} className="text-blue-500/50 flex-shrink-0 mt-1" />
         <p className="text-xs text-gray-300 leading-relaxed">
           {TIPS[tipIndex]}
         </p>
      </div>
      <div className="flex justify-center gap-1 mt-3">
        {TIPS.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 w-1 rounded-full transition-all ${i === tipIndex ? 'bg-blue-500 w-3' : 'bg-gray-700'}`}
          />
        ))}
      </div>
    </div>
  );
};
