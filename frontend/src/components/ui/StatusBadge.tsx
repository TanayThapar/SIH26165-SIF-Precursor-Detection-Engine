import React from 'react';
import { ReviewStatus } from '../../types/report';
import { DriftAlertStatus } from '../../types/drift';
import { AlertTriangle, CheckCircle, Clock, ShieldX, BellRing } from 'lucide-react';

interface StatusBadgeProps {
  status: ReviewStatus | DriftAlertStatus;
  type?: 'review' | 'drift';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'review' }) => {
  let label = status as string;
  let bg = 'bg-slate-100 text-slate-700 border-slate-300';
  let icon = <Clock className="w-3 h-3" />;

  if (type === 'review') {
    switch (status as ReviewStatus) {
      case 'auto_escalated':
        label = 'Auto-Escalated';
        bg = 'bg-signal-50 text-signal-800 border-signal-300';
        icon = <AlertTriangle className="w-3 h-3 text-signal-600" />;
        break;
      case 'review_required':
        label = 'Review Required';
        bg = 'bg-amber-50 text-amber-800 border-amber-300';
        icon = <Clock className="w-3 h-3 text-amber-600" />;
        break;
      case 'reviewed_correct':
        label = 'Confirmed SIF';
        bg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
        icon = <CheckCircle className="w-3 h-3 text-emerald-600" />;
        break;
      case 'reviewed_corrected':
        label = 'Corrected by HSE';
        bg = 'bg-petrol-50 text-petrol-800 border-petrol-300';
        icon = <CheckCircle className="w-3 h-3 text-petrol-600" />;
        break;
      case 'dismissed':
        label = 'Dismissed Non-SIF';
        bg = 'bg-slate-100 text-slate-600 border-slate-300';
        icon = <ShieldX className="w-3 h-3 text-slate-400" />;
        break;
    }
  } else {
    // Drift status
    switch (status as DriftAlertStatus) {
      case 'Open':
        bg = 'bg-signal-50 text-signal-800 border-signal-300';
        icon = <BellRing className="w-3 h-3 text-signal-600" />;
        break;
      case 'Acknowledged':
        bg = 'bg-amber-50 text-amber-800 border-amber-300';
        icon = <Clock className="w-3 h-3 text-amber-600" />;
        break;
      case 'Under Review':
        bg = 'bg-petrol-50 text-petrol-800 border-petrol-300';
        icon = <Clock className="w-3 h-3 text-petrol-600" />;
        break;
      case 'Resolved':
        bg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
        icon = <CheckCircle className="w-3 h-3 text-emerald-600" />;
        break;
    }
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border ${bg}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
};
