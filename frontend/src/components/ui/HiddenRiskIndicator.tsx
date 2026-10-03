import React from 'react';
import { AlertCircle } from 'lucide-react';

interface HiddenRiskIndicatorProps {
  hiddenRisk: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const HiddenRiskIndicator: React.FC<HiddenRiskIndicatorProps> = ({
  hiddenRisk,
  size = 'md',
  showLabel = false,
}) => {
  // Delta formatting: +5, +4, 0, etc.
  const formattedDelta = hiddenRisk > 0 ? `+${hiddenRisk}` : `${hiddenRisk}`;

  let bgClass = 'bg-slate-100 text-slate-700 border-slate-300';
  let badgeSeverity = 'Neutral Risk Gap';

  if (hiddenRisk >= 4) {
    bgClass = 'bg-signal-50 text-signal-700 border-signal-300 ring-1 ring-signal-400/20';
    badgeSeverity = 'Extreme Hidden Risk Gap';
  } else if (hiddenRisk >= 2) {
    bgClass = 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400/20';
    badgeSeverity = 'Elevated Hidden Risk Gap';
  } else if (hiddenRisk === 1) {
    bgClass = 'bg-petrol-50 text-petrol-800 border-petrol-300';
    badgeSeverity = 'Minor Hidden Risk Gap';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-base font-bold px-3 py-1.5',
  };

  return (
    <div className="inline-flex items-center gap-1.5" title={`Hidden Risk = Potential - Actual (${badgeSeverity})`}>
      <span
        className={`font-mono font-semibold rounded border inline-flex items-center gap-1 ${bgClass} ${sizeClasses[size]}`}
      >
        {hiddenRisk >= 3 && <AlertCircle className="w-3.5 h-3.5 text-signal-600 inline" />}
        <span>{formattedDelta}</span>
        {showLabel && <span className="font-sans font-normal opacity-75 ml-0.5">Hidden Risk</span>}
      </span>
    </div>
  );
};
