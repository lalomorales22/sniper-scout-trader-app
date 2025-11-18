
import React, { useEffect, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

export const MarketPulse: React.FC = () => {
  // Simulated market breadth data
  const [breadth, setBreadth] = useState(55); // 55% advancing
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBreadth(prev => Math.min(Math.max(prev + (Math.random() * 10 - 5), 20), 80));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isBullish = breadth > 50;

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2 text-sm font-bold text-white uppercase">
          <Activity className="w-4 h-4 text-blue-500" />
          Market Pulse
        </div>
        <div className={`text-xs font-mono ${isBullish ? 'text-green-400' : 'text-red-400'}`}>
          {isBullish ? 'BULLISH' : 'BEARISH'}
        </div>
      </div>

      {/* Breadth Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold">
          <span>Decliners</span>
          <span>Advancers</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-red-500 transition-all duration-1000"
            style={{ width: `${100 - breadth}%` }}
          ></div>
          <div 
            className="h-full bg-green-500 transition-all duration-1000"
            style={{ width: `${breadth}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[10px] font-mono text-gray-400">
          <span>{(100 - breadth).toFixed(0)}%</span>
          <span>{breadth.toFixed(0)}%</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-black/40 p-2 rounded border border-gray-800 flex flex-col items-center">
           <span className="text-[10px] text-gray-500 uppercase">Velocity</span>
           <div className="flex items-center gap-1 text-xs font-bold text-white mt-1">
              <BarChart3 size={12} />
              High
           </div>
        </div>
        <div className="bg-black/40 p-2 rounded border border-gray-800 flex flex-col items-center">
           <span className="text-[10px] text-gray-500 uppercase">Sentiment</span>
           <div className="flex items-center gap-1 text-xs font-bold text-white mt-1">
              {isBullish ? <TrendingUp size={12} className="text-green-500"/> : <TrendingDown size={12} className="text-red-500"/>}
              {isBullish ? 'Greed' : 'Fear'}
           </div>
        </div>
      </div>
    </div>
  );
};
