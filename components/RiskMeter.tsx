import React from 'react';

interface Props {
  heat: number; // 0-100
}

export const RiskMeter: React.FC<Props> = ({ heat }) => {
  const getHeatColor = (val: number) => {
    if (val < 40) return 'bg-green-500';
    if (val < 70) return 'bg-yellow-500';
    return 'bg-red-600';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1 font-mono">
        <span className="text-gray-400">PORTFOLIO HEAT</span>
        <span className={`${heat > 80 ? 'text-red-500 animate-pulse' : 'text-gray-300'}`}>
            {heat.toFixed(1)}%
        </span>
      </div>
      
      {/* Bar Container */}
      <div className="h-4 bg-gray-800 rounded-full overflow-hidden relative border border-gray-700">
         {/* Zones */}
         <div className="absolute top-0 h-full w-[40%] left-0 border-r border-gray-700/50"></div>
         <div className="absolute top-0 h-full w-[30%] left-[40%] border-r border-gray-700/50"></div>
         
         {/* Fill */}
         <div 
            className={`h-full transition-all duration-1000 ease-out ${getHeatColor(heat)}`} 
            style={{ width: `${heat}%` }}
         >
            {/* Stripe pattern overlay */}
            <div className="w-full h-full opacity-30 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')]"></div>
         </div>
      </div>

      <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
        <span>SAFE</span>
        <span>CAUTION</span>
        <span>REKT</span>
      </div>
    </div>
  );
};
