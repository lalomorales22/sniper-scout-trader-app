
import React from 'react';
import { ActivePosition } from '../types';
import { Wallet, ArrowRight, AlertOctagon } from 'lucide-react';

interface Props {
  positions: ActivePosition[];
  portfolioHeat: number;
}

export const ActiveTradeMonitor: React.FC<Props> = ({ positions, portfolioHeat }) => {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-4">
       {/* Header */}
       <div className="flex justify-between items-center border-b border-gray-800 pb-2">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
             <Wallet className="w-4 h-4 text-blue-500" />
             ACTIVE POSITIONS
          </div>
          <div className={`text-xs font-mono ${portfolioHeat > 60 ? 'text-red-500' : 'text-gray-400'}`}>
             HEAT: {portfolioHeat}%
          </div>
       </div>

       {/* Heat Bar */}
       <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden flex">
          {positions.map((p, i) => {
             // Visualize each position's contribution to heat (mock calculation)
             const heatShare = 15; // roughly 15% per position for demo
             return (
                <div 
                   key={p.id} 
                   className={`h-full border-r border-black/50 ${p.type === 'LONG' ? 'bg-blue-500' : 'bg-purple-500'}`} 
                   style={{ width: `${heatShare}%` }}
                ></div>
             );
          })}
          {/* Empty Space */}
       </div>

       {/* Positions List */}
       <div className="space-y-3">
          {positions.length === 0 ? (
             <div className="text-center py-4 text-xs text-gray-600 italic">No active positions. Capital deployed: 0%</div>
          ) : (
             positions.map(pos => {
                const pnlPct = ((pos.currentPrice - pos.entryPrice) / pos.entryPrice) * 100 * (pos.type === 'SHORT' ? -1 : 1) * pos.leverage;
                const isWin = pnlPct > 0;
                
                return (
                   <div key={pos.id} className="bg-black/40 border border-gray-800 p-2 rounded text-xs">
                      <div className="flex justify-between mb-1">
                         <span className={`font-bold ${pos.type === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                            {pos.symbol} {pos.type} {pos.leverage}x
                         </span>
                         <span className={`font-mono font-bold ${isWin ? 'text-green-500' : 'text-red-500'}`}>
                            {isWin ? '+' : ''}{pnlPct.toFixed(2)}%
                         </span>
                      </div>
                      
                      <div className="flex justify-between text-gray-500 mb-2">
                         <span>Entry: ${pos.entryPrice}</span>
                         <span>Curr: ${pos.currentPrice}</span>
                      </div>

                      {/* Mini Progress Bar to TP/SL */}
                      <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
                         {/* Center Marker */}
                         <div className="absolute left-1/2 top-0 h-full w-0.5 bg-white/20"></div>
                         {/* Progress */}
                         <div 
                            className={`absolute h-full transition-all ${isWin ? 'bg-green-500 right-1/2 rounded-r' : 'bg-red-500 left-1/2 -translate-x-full rounded-l'}`}
                            style={{ width: `${Math.min(Math.abs(pnlPct), 50)}%` }}
                         ></div>
                      </div>
                      <div className="flex justify-between text-[8px] text-gray-600 mt-1">
                         <span>SL ${pos.slPrice}</span>
                         <span>TP ${pos.tpPrice}</span>
                      </div>
                   </div>
                );
             })
          )}
       </div>

       {portfolioHeat > 80 && (
          <div className="flex items-center gap-2 text-[10px] text-red-400 bg-red-950/30 p-2 rounded">
             <AlertOctagon size={12} />
             MAX EXPOSURE REACHED. NO NEW TRADES.
          </div>
       )}
    </div>
  );
};
