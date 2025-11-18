
import React from 'react';

interface Props {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

export const MiniChart: React.FC<Props> = ({ data, color, width = 600, height = 100 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-24 flex items-center justify-center bg-gray-900/30 rounded text-xs text-gray-600 border border-dashed border-gray-800">
        No Chart Data
      </div>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Generate SVG Path
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  // Determine trend for gradient
  const startPrice = data[0];
  const endPrice = data[data.length - 1];
  const isUp = endPrice >= startPrice;
  const strokeColor = isUp ? '#22c55e' : '#ef4444'; // Green or Red
  const gradientId = `gradient-${isUp ? 'up' : 'down'}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full h-24 bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden relative">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Fill Area */}
        <path
          d={`M 0,${height} L ${points} L ${width},${height} Z`}
          fill={`url(#${gradientId})`}
        />
        
        {/* Line */}
        <path
          d={`M ${points}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      
      {/* Price Labels */}
      <div className="absolute top-1 right-2 text-[10px] font-mono text-gray-400 bg-black/50 px-1 rounded">
        H: ${max.toLocaleString()}
      </div>
      <div className="absolute bottom-1 right-2 text-[10px] font-mono text-gray-400 bg-black/50 px-1 rounded">
        L: ${min.toLocaleString()}
      </div>
    </div>
  );
};
