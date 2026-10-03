import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    suffix?: string;
    isPositiveGood?: boolean;
    periodLabel?: string;
  };
  accentColor?: 'petrol' | 'amber' | 'signal' | 'graphite';
  icon?: React.ReactNode;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  change,
  accentColor = 'graphite',
  icon,
  onClick,
}) => {
  const getAccentBorder = () => {
    switch (accentColor) {
      case 'petrol':
        return 'border-l-4 border-l-petrol-600';
      case 'amber':
        return 'border-l-4 border-l-amber-500';
      case 'signal':
        return 'border-l-4 border-l-signal-600';
      default:
        return 'border-l-4 border-l-graphite-400';
    }
  };

  const renderTrend = () => {
    if (!change) return null;
    const isZero = change.value === 0;
    const isPositive = change.value > 0;
    const isGood = change.isPositiveGood ? isPositive : !isPositive;

    const textColor = isZero
      ? 'text-graphite-500'
      : isGood
      ? 'text-operational-700 bg-operational-50'
      : 'text-signal-700 bg-signal-50';

    return (
      <div className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${textColor}`}>
        {isZero ? (
          <Minus className="w-3 h-3" />
        ) : isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        <span>
          {isPositive ? '+' : ''}
          {change.value}
          {change.suffix || '%'}
        </span>
        {change.periodLabel && (
          <span className="text-graphite-400 font-normal ml-0.5">vs {change.periodLabel}</span>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded border border-surface-border p-4 shadow-panel transition-all ${getAccentBorder()} ${
        onClick ? 'cursor-pointer hover:border-surface-border-strong hover:shadow-elevated' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-graphite-500">
          {label}
        </span>
        {icon && <div className="text-graphite-400">{icon}</div>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-graphite-900 font-mono-nums">
          {value}
        </span>
      </div>

      {(subtitle || change) && (
        <div className="mt-2 flex items-center justify-between text-xs text-graphite-600">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {renderTrend()}
        </div>
      )}
    </div>
  );
};
