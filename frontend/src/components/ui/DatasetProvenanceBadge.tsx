import React from 'react';
import { DatasetProvenanceType } from '../../types/report';
import { Database, ShieldAlert, Cpu, CheckCircle2 } from 'lucide-react';

interface DatasetProvenanceBadgeProps {
  sourceType: DatasetProvenanceType;
  label?: string;
  size?: 'sm' | 'md';
}

export const DatasetProvenanceBadge: React.FC<DatasetProvenanceBadgeProps> = ({
  sourceType,
  label,
  size = 'sm',
}) => {
  const getBadgeConfig = () => {
    switch (sourceType) {
      case 'synthetic':
        return {
          icon: <Cpu className="w-3 h-3 text-amber-700" />,
          text: label || 'Synthetic Demo Data',
          classes: 'bg-amber-50 text-amber-800 border-amber-300',
        };
      case 'proxy':
        return {
          icon: <Database className="w-3 h-3 text-petrol-700" />,
          text: label || 'Public Proxy Dataset',
          classes: 'bg-petrol-50 text-petrol-800 border-petrol-300',
        };
      case 'weakly_supervised':
        return {
          icon: <ShieldAlert className="w-3 h-3 text-slate-700" />,
          text: label || 'Weakly Supervised',
          classes: 'bg-slate-100 text-slate-800 border-slate-300',
        };
      case 'gold':
      case 'manual':
        return {
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-700" />,
          text: label || 'Expert Gold Label',
          classes: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        };
      case 'backend_live':
        return {
          icon: <CheckCircle2 className="w-3 h-3 text-petrol-700" />,
          text: label || 'OIL Production Live',
          classes: 'bg-petrol-50 text-petrol-800 border-petrol-300',
        };
      default:
        return {
          icon: <Database className="w-3 h-3 text-slate-600" />,
          text: label || 'Synthetic Dataset',
          classes: 'bg-slate-50 text-slate-700 border-slate-300',
        };
    }
  };

  const { icon, text, classes } = getBadgeConfig();
  const pad = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${classes} ${pad}`}
      title="Dataset Provenance Tag"
    >
      {icon}
      <span>{text}</span>
    </span>
  );
};
