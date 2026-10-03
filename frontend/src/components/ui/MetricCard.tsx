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
        return 'border-l-4 border-l-petrol-500 hover:border-l-petrol-400';
      case 'amber':
        return 'border-l-4 border-l-amber-500 hover:border-l-amber-400';
      case 'signal':
        return 'border-l-4 border-l-signal-600 hover:border-l-signal-500';
      default:
        return 'border-l-4 border-l-graphite-400 hover:border-l-graphite-300';
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
      ? 'text-operational-700 bg-operational-50 dark:bg-operational-950/40 dark:text-operational-400 border border-operational-200 dark:border-operational-800'
      : 'text-signal-700 bg-signal-50 dark:bg-signal-950/40 dark:text-signal-400 border border-signal-200 dark:border-signal-800';

    return (
      <div className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded transition-transform group-hover:scale-105 duration-200 ${textColor}`}>
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
          <span className="opacity-75 font-normal ml-0.5">vs {change.periodLabel}</span>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden bg-surface rounded-lg border border-surface-border p-4 shadow-panel transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-elevated ${getAccentBorder()} ${
        onClick ? 'cursor-pointer hover:border-surface-border-strong ring-1 ring-transparent hover:ring-petrol-500/20' : ''
      }`}
    >
      {/* Subtle hover gradient shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-graphite-500 dark:text-slate-400">
          {label}
        </span>
        {icon && (
          <div className="text-graphite-400 group-hover:text-petrol-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-black tracking-tight text-graphite-900 font-mono-nums transition-colors group-hover:text-petrol-600 dark:group-hover:text-petrol-300">
          {value}
        </span>
      </div>

      {(subtitle || change) && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-graphite-600">
          {subtitle && (
            <span className="truncate text-[11px] font-medium opacity-85">
              {subtitle}
            </span>
          )}
          {renderTrend()}
        </div>
      )}
    </div>
  );
};
