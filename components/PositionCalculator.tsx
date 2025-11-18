import React, { useState, useEffect } from 'react';
import { StrategyAnalysis } from '../types';
import { Calculator, AlertOctagon } from 'lucide-react';

interface Props {
  analysis: StrategyAnalysis;
  portfolioSize: number;
  currentHeat: number; // 0-100
}

export const PositionCalculator: React.FC<Props> = ({ analysis, portfolioSize, currentHeat }) => {
  const [leverage, setLeverage] = useState(1);
  
  // Auto-set leverage based on signal strength (simulating the "Intelligence")
  useEffect(() => {
    if (analysis.type === 'BURRY_SHORT') {
        if (analysis.score === 5) setLeverage(50);
        else if (analysis.score === 4) setLeverage(35);
        else setLeverage(20);
    } else if (analysis.type === 'PENGUIN_LONG') {
        setLeverage(analysis.score >= 4 ? 40 : 25);
    } else {
        setLeverage(1);
    }
  }, [analysis]);

  if (analysis.type === 'NEUTRAL' || analysis.type === 'DANGER_TRAP') return null;

  const suggestedSizePct = analysis.score === 5 ? 0.8 : analysis.score === 4 ? 0.7 : 0.4;
  const positionSizeUSD = portfolioSize * suggestedSizePct;
  const positionValue = positionSizeUSD * leverage;
  
  // Simulated risk metrics
  const liquidationRisk = (1 / leverage) * 100; // rough calc
  const newHeat = currentHeat + (suggestedSizePct * 100);
  const isHeatCritical = newHeat > 80;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono mt-4">
      <div className="flex items-center gap-2 mb-4 text-blue-400">
        <Calculator className="w-5 h-5" />
        <h3 className="font-bold uppercase">Position Size Intelligence</h3>
      </div>

      <div className="space-y-4">
        {/* Leverage Slider */}
        <div>
            <div className="flex justify-between text-xs mb-2 text-gray-400">
                <span>LEVERAGE</span>
                <span className="text-white font-bold">{leverage}x</span>
            </div>
            <input 
                type="range" 
                min="1" 
                max="100" 
                value={leverage} 
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-800 p-2 rounded">
                <div className="text-gray-500 text-xs">NET DEPLOYMENT</div>
                <div className="text-white font-bold">${positionSizeUSD.toLocaleString()}</div>
                <div className="text-xs text-blue-400">({(suggestedSizePct * 100).toFixed(0)}% of Port)</div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
                <div className="text-gray-500 text-xs">POSITION VALUE</div>
                <div className="text-white font-bold">${positionValue.toLocaleString()}</div>
            </div>
        </div>

        {/* Risk Breakdown */}
        <div className="border-t border-gray-800 pt-3 space-y-2">
             <div className="flex justify-between text-xs">
                <span className="text-gray-400">STOP LOSS (3%)</span>
                <span className="text-red-400">-${(positionValue * 0.03).toLocaleString()}</span>
             </div>
             <div className="flex justify-between text-xs">
                <span className="text-gray-400">LIQUIDATION (-{liquidationRisk.toFixed(2)}%)</span>
                <span className="text-red-500 font-bold">-${positionSizeUSD.toLocaleString()}</span>
             </div>
             <div className="flex justify-between text-xs mt-2 pt-2 border-t border-gray-800">
                 <span className="text-gray-400">PORTFOLIO HEAT</span>
                 <span className={`${isHeatCritical ? 'text-red-500 blink' : 'text-yellow-500'}`}>
                    {currentHeat}% → {newHeat.toFixed(0)}% {isHeatCritical ? '⚠ DANGER' : ''}
                 </span>
             </div>
        </div>
        
        {isHeatCritical && (
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 p-2 rounded text-xs text-red-300">
                <AlertOctagon className="w-4 h-4" />
                <span>OVEREXPOSED. Reduce size recommended.</span>
            </div>
        )}
      </div>
    </div>
  );
};
