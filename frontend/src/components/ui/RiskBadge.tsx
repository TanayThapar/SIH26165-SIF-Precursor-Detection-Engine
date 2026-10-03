import React from 'react';

interface RiskBadgeProps {
  band?: 'Critical SIF' | 'High SIF' | 'Medium SIF' | 'Low / Non-SIF';
  riskBand?: 'Critical SIF' | 'High SIF' | 'Medium SIF' | 'Low / Non-SIF';
  probability?: number;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ band, riskBand, probability, size = 'md' }) => {
  const effectiveBand = band || riskBand || 'Medium SIF';
  let color = 'bg-slate-100 text-slate-700 border-slate-300';
  let dotColor = 'bg-slate-400';

  if (effectiveBand === 'Critical SIF') {
    color = 'bg-signal-50 text-signal-800 border-signal-200';
    dotColor = 'bg-signal-600';
  } else if (effectiveBand === 'High SIF') {
    color = 'bg-amber-50 text-amber-800 border-amber-300';
    dotColor = 'bg-amber-600';
  } else if (effectiveBand === 'Medium SIF') {
    color = 'bg-petrol-50 text-petrol-800 border-petrol-200';
    dotColor = 'bg-petrol-600';
  }

  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded border ${color} ${pad}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{effectiveBand}</span>
      {typeof probability === 'number' && (
        <span className="font-mono text-[11px] opacity-80 pl-1 border-l border-current/20">
          {(probability * 100).toFixed(0)}%
        </span>
      )}
    </span>
  );
};
