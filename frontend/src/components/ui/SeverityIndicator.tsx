import React from 'react';
import { SeverityLevel, SEVERITY_LEVELS } from '../../types/report';

interface SeverityIndicatorProps {
  level: SeverityLevel;
  showDescription?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  labelOverride?: string;
}

export const SeverityIndicator: React.FC<SeverityIndicatorProps> = ({
  level,
  showDescription = false,
  showLabel = true,
  size = 'md',
  labelOverride,
}) => {
  const def = SEVERITY_LEVELS[level] || SEVERITY_LEVELS[1];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`font-mono font-medium rounded border inline-flex items-center gap-1.5 ${def.colorClass} ${sizeClasses[size]}`}
      >
        <span className="font-semibold">{def.code}</span>
        {showLabel && (
          <>
            <span className="opacity-40">•</span>
            <span>{labelOverride || def.label}</span>
          </>
        )}
      </span>
      {showDescription && (
        <span className="text-xs text-graphite-500 hidden sm:inline">
          ({def.description})
        </span>
      )}
    </div>
  );
};
