import React from 'react';
import { LifeSavingRule } from '../../types/report';
import { ShieldAlert, Zap, Flame, Truck, Anchor, HardHat, FileCheck, Eye } from 'lucide-react';

interface LifeSavingRuleTagsProps {
  rules: LifeSavingRule[];
  size?: 'xs' | 'sm';
  maxVisible?: number;
}

export const LifeSavingRuleTags: React.FC<LifeSavingRuleTagsProps> = ({
  rules,
  size = 'sm',
  maxVisible = 3,
}) => {
  const visible = rules.slice(0, maxVisible);
  const overflow = rules.length - maxVisible;

  const getLsrIcon = (rule: LifeSavingRule) => {
    switch (rule) {
      case 'Line of Fire': return <Eye className="w-3 h-3 text-signal-700" />;
      case 'Energy Isolation': return <Zap className="w-3 h-3 text-amber-700" />;
      case 'Safe Mechanical Lifting': return <Anchor className="w-3 h-3 text-petrol-700" />;
      case 'Working at Height': return <HardHat className="w-3 h-3 text-graphite-700" />;
      case 'Hot Work': return <Flame className="w-3 h-3 text-orange-700" />;
      case 'Confined Space': return <ShieldAlert className="w-3 h-3 text-signal-700" />;
      case 'Driving': return <Truck className="w-3 h-3 text-blue-700" />;
      case 'Work Authorization': return <FileCheck className="w-3 h-3 text-emerald-700" />;
      default: return <ShieldAlert className="w-3 h-3 text-graphite-500" />;
    }
  };

  const pad = size === 'xs' ? 'text-[11px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <div className="inline-flex flex-wrap items-center gap-1.5">
      {visible.map((rule) => (
        <span
          key={rule}
          className={`inline-flex items-center gap-1 bg-surface-sunken text-graphite-700 border border-surface-border rounded font-medium ${pad}`}
          title={`IOGP Life-Saving Rule: ${rule}`}
        >
          {getLsrIcon(rule)}
          <span>{rule}</span>
        </span>
      ))}
      {overflow > 0 && (
        <span
          className="text-[11px] text-graphite-500 px-1.5 py-0.5 bg-canvas-subtle rounded border border-surface-border"
          title={rules.slice(maxVisible).join(', ')}
        >
          +{overflow} more
        </span>
      )}
    </div>
  );
};
