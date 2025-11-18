
import React, { useState, useEffect } from 'react';
import { StrategyAnalysis, SignalCheck } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, Terminal, Clock } from 'lucide-react';

interface Props {
  analysis: StrategyAnalysis;
}

const StatusIcon = ({ status }: { status: SignalCheck['status'] }) => {
  switch (status) {
    case 'PASS': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'WARN': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'FAIL': return <XCircle className="w-4 h-4 text-red-600" />;
    default: return <div className="w-4 h-4 border border-gray-600 rounded-full" />;
  }
};

export const ConfluenceMatrix: React.FC<Props> = ({ analysis }) => {
  const [age, setAge] = useState(0);

  useEffect(() => {
    if (analysis.signalTimestamp) {
      const timer = setInterval(() => {
        setAge(Math.floor((Date.now() - analysis.signalTimestamp) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setAge(0);
    }
  }, [analysis.signalTimestamp, analysis.symbol]); // Reset on symbol change

  const isTrap = analysis.type === 'DANGER_TRAP';
  const borderColor = isTrap ? 'border-red-600' : analysis.confidence === 'MAXIMUM' ? 'border-green-500' : 'border-gray-700';
  
  // Decay Logic
  const freshness = age < 300 ? 'FRESH' : age < 900 ? 'FADING' : 'STALE';
  const decayPct = Math.max(0, 100 - (age / 1800 * 100));

  if (analysis.type === 'NEUTRAL') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-600 border border-dashed border-gray-800 rounded-lg bg-gray-900/20 p-10">
        <Terminal className="w-12 h-12 mb-4 opacity-30" />
        <p className="font-mono text-sm tracking-widest">SYSTEM IDLE</p>
        <p className="text-xs mt-2">Awaiting high-probability setup...</p>
      </div>
    );
  }

  return (
    <div className={`bg-black border ${borderColor} rounded-lg overflow-hidden font-mono text-sm shadow-xl relative`}>
      
      {/* Header */}
      <div className={`${isTrap ? 'bg-red-950 text-red-100' : 'bg-gray-900 text-gray-100'} p-3 border-b border-gray-800 flex justify-between items-center`}>
        <span className="font-bold tracking-wider">{analysis.headline}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded border ${
          analysis.score === 5 ? 'bg-green-950 border-green-800 text-green-400' : 'bg-yellow-950 border-yellow-800 text-yellow-400'
        }`}>
           SCORE: {analysis.score}/{analysis.maxScore}
        </span>
      </div>

      {/* Matrix Rows */}
      <div className="p-4 space-y-1 bg-gray-950">
        {analysis.checks.map((check, idx) => (
          <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-900 last:border-0 hover:bg-gray-900/50 px-2 -mx-2 rounded transition-colors">
            <div className="flex items-center gap-3">
              <StatusIcon status={check.status} />
              <span className={`w-24 ${check.status === 'FAIL' ? 'text-red-400 line-through' : 'text-gray-400'}`}>
                {check.name}
              </span>
              <span className="text-gray-200 font-bold">{check.value}</span>
            </div>
            <div className="flex items-center">
              <span className="hidden sm:block text-gray-700 mx-2">━━━━━━━━</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                check.status === 'PASS' ? 'text-green-500' :
                check.status === 'WARN' ? 'text-yellow-500' :
                check.status === 'FAIL' ? 'text-red-500' : 'text-gray-600'
              }`}>
                {check.details}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Historical Pattern Match Section */}
      {analysis.historicalData && (
        <div className="border-t border-gray-800 bg-gray-900/30 p-4">
           <div className="flex justify-between items-start mb-2">
              <div className="text-xs text-gray-500 uppercase font-bold">Historical Pattern Match</div>
              <div className={`text-xs font-bold ${analysis.historicalData.winRate > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                {analysis.historicalData.winRate}% Win Rate
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4 text-[10px] text-gray-400">
              <div>
                 <span className="block text-gray-600 mb-1">SIMILAR WIN</span>
                 <span className="text-green-400/80">{analysis.historicalData.similarWin}</span>
              </div>
              <div>
                 <span className="block text-gray-600 mb-1">SIMILAR LOSS</span>
                 <span className="text-red-400/80">{analysis.historicalData.similarLoss}</span>
              </div>
           </div>
        </div>
      )}

      {/* Footer / Signal Freshness */}
      <div className="bg-black p-3 border-t border-gray-800 flex items-center gap-4 text-xs">
        <div className="flex-1">
           <div className="flex justify-between mb-1">
              <span className="text-gray-500 flex items-center gap-1"><Clock size={10}/> SIGNAL DECAY</span>
              <span className={`${freshness === 'FRESH' ? 'text-green-400' : 'text-orange-400'}`}>{freshness} ({age}s)</span>
           </div>
           <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${decayPct > 50 ? 'bg-green-500' : 'bg-orange-500'}`}
                style={{ width: `${decayPct}%` }}
              ></div>
           </div>
        </div>
        <div className="text-right">
           <div className="text-gray-500">AVG PNL</div>
           <div className="font-bold text-green-400">+{analysis.historicalData?.avgPnL}%</div>
        </div>
      </div>

    </div>
  );
};
