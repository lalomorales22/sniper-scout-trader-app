
import React, { useState, useEffect } from 'react';
import { StrategyAnalysis, UserProfileConfig } from '../types';
import { Calculator, AlertOctagon, TrendingDown, DollarSign, Crosshair } from 'lucide-react';

interface Props {
  analysis: StrategyAnalysis;
  portfolioSize: number;
  currentHeat: number;
  userProfile: UserProfileConfig;
  currentPrice: number;
  symbol: string;
  onExecuteTrade: (symbol: string, type: 'LONG' | 'SHORT', size: number, leverage: number, entry: number, tp: number, sl: number) => void;
}

export const PositionCalculator: React.FC<Props> = ({ analysis, portfolioSize, currentHeat, userProfile, currentPrice, symbol, onExecuteTrade }) => {
  const [leverage, setLeverage] = useState(1);
  
  // Auto-set leverage based on profile and score
  useEffect(() => {
    let baseLev = 1;
    if (analysis.score === 5) baseLev = userProfile.leverageCap; // Max cap for 5/5
    else if (analysis.score === 4) baseLev = userProfile.leverageCap * 0.7;
    else baseLev = userProfile.leverageCap * 0.4;
    
    setLeverage(Math.floor(baseLev));
  }, [analysis, userProfile]);

  if (analysis.type === 'NEUTRAL' || analysis.type === 'DANGER_TRAP') return null;

  const suggestedSizePct = analysis.score === 5 ? 0.8 : analysis.score === 4 ? 0.7 : 0.4;
  const positionSizeUSD = portfolioSize * suggestedSizePct;
  const positionValue = positionSizeUSD * leverage;
  
  // Fees (Est 0.06% taker)
  const entryFee = positionValue * 0.0006;
  
  // Risk Math
  const liquidationPct = (1 / leverage) * 100; 
  const stopLossPct = 3.0; // Fixed 3% SL rule from spec
  
  // Prices
  const isShort = analysis.type === 'BURRY_SHORT';
  const slPrice = isShort ? currentPrice * (1 + stopLossPct/100) : currentPrice * (1 - stopLossPct/100);
  const tpPrice = isShort ? currentPrice * (1 - 0.09) : currentPrice * (1 + 0.12); // Approx targets based on historical win avg
  
  const slLossAmount = positionValue * (stopLossPct / 100);

  const newHeat = currentHeat + (suggestedSizePct * 100);
  const isHeatCritical = newHeat > 80;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono mt-4 shadow-lg">
      <div className="flex items-center justify-between mb-4 text-blue-400 border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            <h3 className="font-bold uppercase">Execution Engine</h3>
        </div>
        <span className="text-[10px] text-gray-500 bg-gray-950 px-2 py-1 rounded">
            PROFILE: {userProfile.name}
        </span>
      </div>

      <div className="space-y-5">
        {/* Inputs */}
        <div>
            <div className="flex justify-between text-xs mb-2 text-gray-400">
                <span>LEVERAGE (Max {userProfile.leverageCap}x)</span>
                <span className="text-white font-bold text-lg">{leverage}x</span>
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

        {/* Main Numbers */}
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-black/40 p-3 rounded border border-gray-800">
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Margin</div>
                <div className="text-white font-bold text-lg">${positionSizeUSD.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
                <div className="text-[10px] text-blue-400">{(suggestedSizePct * 100).toFixed(0)}% of Port</div>
            </div>
            <div className="bg-black/40 p-3 rounded border border-gray-800">
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Position Value</div>
                <div className="text-white font-bold text-lg">${positionValue.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
                <div className="text-[10px] text-red-400">Fee: -${entryFee.toFixed(1)}</div>
            </div>
        </div>

        {/* Visual Risk Distance */}
        <div className="space-y-2">
            <div className="text-[10px] text-gray-500 uppercase font-bold">Distance to Target</div>
            <div className="h-6 w-full bg-gray-800 rounded overflow-hidden flex relative">
                 {/* Liquidation Zone */}
                 <div 
                    className="h-full bg-red-600/80 flex items-center justify-center text-[10px] font-bold text-white relative z-10"
                    style={{ width: `${Math.min(liquidationPct * 3, 100)}%` }} // Scaled for visibility
                 >
                    LIQ {liquidationPct.toFixed(2)}%
                 </div>
                 
                 {/* Stop Loss Zone */}
                 <div 
                    className="h-full bg-orange-500/50 flex items-center justify-center text-[10px] font-bold text-white relative z-0"
                    style={{ width: `${(stopLossPct - liquidationPct) * 3}%` }}
                 >
                    SL
                 </div>
                 
                 {/* Safe Zone */}
                 <div className="flex-1 bg-green-900/20"></div>
            </div>
        </div>

        {/* Outcome Scenarios */}
        <div className="border-t border-gray-800 pt-3 space-y-2 text-xs">
             <div className="flex justify-between group">
                <span className="text-gray-400 flex items-center gap-2"><DollarSign size={12}/> EXP. WIN (+25%)</span>
                <span className="text-green-400 font-bold">+${(positionValue * 0.25).toLocaleString(undefined, {maximumFractionDigits:0})}</span>
             </div>
             <div className="flex justify-between group">
                <span className="text-gray-400 flex items-center gap-2"><TrendingDown size={12}/> STOP LOSS (-3%)</span>
                <span className="text-orange-400 font-bold">-${slLossAmount.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
             </div>
        </div>
        
        {/* ACTION BUTTON */}
        <button 
            onClick={() => onExecuteTrade(
                symbol, 
                isShort ? 'SHORT' : 'LONG', 
                positionSizeUSD, 
                leverage, 
                currentPrice,
                tpPrice,
                slPrice
            )}
            disabled={isHeatCritical}
            className={`w-full py-4 rounded font-bold text-white tracking-widest uppercase shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2
                ${isHeatCritical 
                    ? 'bg-gray-800 cursor-not-allowed text-gray-500' 
                    : isShort ? 'bg-red-600 hover:bg-red-500 shadow-red-900/50' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/50'
                }
            `}
        >
           <Crosshair size={20} />
           {isHeatCritical ? 'EXPOSURE LIMIT EXCEEDED' : `EXECUTE ${isShort ? 'SHORT' : 'LONG'}`}
        </button>
      </div>
    </div>
  );
};
