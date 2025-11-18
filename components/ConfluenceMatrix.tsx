import React from 'react';
import { StrategyAnalysis, SignalCheck } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, Terminal } from 'lucide-react';

interface Props {
  analysis: StrategyAnalysis;
}

const StatusIcon = ({ status }: { status: SignalCheck['status'] }) => {
  switch (status) {
    case 'PASS': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    case 'WARN': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    case 'FAIL': return <XCircle className="w-5 h-5 text-red-500" />;
    default: return <div className="w-5 h-5 border-2 border-gray-600 rounded-full" />;
  }
};

export const ConfluenceMatrix: React.FC<Props> = ({ analysis }) => {
  const isTrap = analysis.type === 'DANGER_TRAP';
  const borderColor = isTrap ? 'border-red-600' : analysis.confidence === 'MAXIMUM' ? 'border-green-400' : 'border-blue-500/50';
  const glow = isTrap ? 'shadow-[0_0_15px_rgba(220,38,38,0.3)]' : analysis.confidence === 'MAXIMUM' ? 'shadow-[0_0_20px_rgba(74,222,128,0.2)]' : '';

  if (analysis.type === 'NEUTRAL') {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 border border-gray-800 rounded-lg bg-gray-900/50">
        <div className="text-center animate-pulse">
          <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>SCANNING MARKETS...</p>
          <p className="text-xs font-mono mt-2">AWAITING SIGNAL CONFLUENCE</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 border ${borderColor} rounded-lg p-0 overflow-hidden font-mono text-sm ${glow} transition-all duration-500`}>
      {/* Header */}
      <div className={`${isTrap ? 'bg-red-900/80 text-white' : 'bg-gray-800 text-gray-100'} p-3 border-b border-gray-700 flex justify-between items-center`}>
        <span className="font-bold tracking-wider">{analysis.headline}</span>
        {analysis.checks.length > 0 && !isTrap && (
             <span className={`text-xs px-2 py-1 rounded ${analysis.score >= 4 ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
               SCORE: {analysis.score}/{analysis.maxScore}
             </span>
        )}
      </div>

      {/* Matrix Body */}
      <div className="p-4 space-y-3 bg-gray-950/80 backdrop-blur-sm">
        {analysis.checks.map((check, idx) => (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <StatusIcon status={check.status} />
              <span className={`font-semibold ${check.status === 'FAIL' ? 'text-red-400' : 'text-gray-300'}`}>
                {check.name}:
              </span>
              <span className="text-gray-100">{check.value}</span>
            </div>
            <div className="flex items-center">
              <div className="h-[1px] bg-gray-800 w-8 mx-2 hidden sm:block"></div>
              <span className={`text-xs font-bold uppercase ${
                check.status === 'PASS' ? 'text-green-400' :
                check.status === 'WARN' ? 'text-yellow-500' :
                check.status === 'FAIL' ? 'text-red-500' : 'text-gray-500'
              }`}>
                {check.details}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-900 p-4 border-t border-gray-800 space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>CONVICTION: <strong className={analysis.confidence === 'MAXIMUM' ? 'text-green-400' : 'text-white'}>{analysis.confidence}</strong></span>
          <span>WIN RATE: {analysis.historicalWinRate}</span>
        </div>
        
        {analysis.divergenceAngle && (
           <div className="flex justify-between text-xs text-blue-400 font-bold">
              <span>DIVERGENCE ANGLE</span>
              <span>{analysis.divergenceAngle.toFixed(1)}% SPREAD</span>
           </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-800">
           <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">RECOMMENDATION</span>
              <span className={`font-bold text-sm ${isTrap ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                {analysis.recommendation}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
};
