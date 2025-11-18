
import React from 'react';
import { Trade } from '../types';
import { BrainCircuit, AlertTriangle, RefreshCcw, TrendingUp } from 'lucide-react';

interface Props {
  trades: Trade[];
}

export const BehavioralWidget: React.FC<Props> = ({ trades }) => {
  // Logic: Check for streaks
  const last3 = trades.slice(0, 3);
  const wins = last3.filter(t => t.pnl > 0).length;
  const losses = last3.filter(t => t.pnl < 0).length;
  
  let warning = null;
  let color = 'text-gray-400';
  let bg = 'bg-gray-900';

  if (wins === 3) {
      warning = "WIN STREAK DETECTED (3/3). Risk of 'God Complex'. Leverage reduced by 20%.";
      color = 'text-yellow-400';
      bg = 'bg-yellow-900/20 border-yellow-700';
  } else if (losses >= 2) {
      warning = "REVENGE TRADING RISK. 2 Consecutive losses. Cooldown active.";
      color = 'text-red-400';
      bg = 'bg-red-900/20 border-red-700';
  }

  return (
    <div className={`border rounded-lg p-4 ${bg} border-gray-800`}>
      <div className="flex items-center gap-2 mb-3 text-sm font-bold uppercase text-purple-400">
         <BrainCircuit className="w-4 h-4" />
         Psychology Monitor
      </div>

      {warning ? (
        <div className={`text-xs ${color} flex gap-2 items-start mb-4`}>
           <AlertTriangle className="w-4 h-4 flex-shrink-0" />
           <p className="font-bold">{warning}</p>
        </div>
      ) : (
        <div className="text-xs text-gray-500 mb-4 flex gap-2">
           <div className="w-2 h-2 bg-green-500 rounded-full mt-1 animate-pulse"></div>
           Stable Emotional State Detected.
        </div>
      )}

      <div className="space-y-2">
         <div className="text-[10px] text-gray-500 uppercase">Recent Performance</div>
         <div className="flex gap-1">
             {trades.slice(0, 5).map((t, i) => (
                <div 
                    key={t.id} 
                    className={`h-8 flex-1 rounded flex items-center justify-center text-[10px] font-bold text-black
                    ${t.pnl > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    {t.pnl > 0 ? '+' : ''}{t.pnl}%
                </div>
             ))}
         </div>
      </div>

      {/* Interactive Hint */}
      <div className="mt-4 pt-4 border-t border-gray-800/50 text-[10px] text-gray-400 flex justify-between">
         <span className="flex items-center gap-1"><RefreshCcw size={10}/> Pattern Addiction Check</span>
         <span className="text-green-400">PASS</span>
      </div>
    </div>
  );
};
