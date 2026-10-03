import React, { useState } from 'react';
import { ExtractedEvidence, EvidenceCategory } from '../../types/report';
import { Zap, Eye, ShieldAlert, CheckCircle2, MapPin } from 'lucide-react';

interface EvidenceHighlighterProps {
  text: string;
  evidenceList: ExtractedEvidence[];
  onSelectEvidence?: (evidence: ExtractedEvidence) => void;
  selectedEvidenceId?: string | null;
}

const CATEGORY_STYLES: Record<
  EvidenceCategory,
  { bg: string; border: string; text: string; label: string; icon: React.ReactNode }
> = {
  ENERGY: {
    bg: 'bg-amber-100/70',
    border: 'border-b-2 border-amber-500',
    text: 'text-amber-950 font-medium',
    label: 'High Energy Source',
    icon: <Zap className="w-3 h-3 text-amber-700" />,
  },
  EXPOSURE: {
    bg: 'bg-rose-100/70',
    border: 'border-b-2 border-signal-500',
    text: 'text-rose-950 font-medium',
    label: 'Personnel Exposure / Line of Fire',
    icon: <Eye className="w-3 h-3 text-signal-700" />,
  },
  BARRIER: {
    bg: 'bg-indigo-100/70',
    border: 'border-b-2 border-indigo-500',
    text: 'text-indigo-950 font-medium',
    label: 'Barrier Condition',
    icon: <ShieldAlert className="w-3 h-3 text-indigo-700" />,
  },
  OUTCOME: {
    bg: 'bg-slate-200/80',
    border: 'border-b-2 border-slate-400 line-through decoration-slate-400',
    text: 'text-slate-600',
    label: 'Outcome Phrase (Masked in Blind Mode)',
    icon: <CheckCircle2 className="w-3 h-3 text-slate-500" />,
  },
  CONTEXT: {
    bg: 'bg-petrol-100/70',
    border: 'border-b-2 border-petrol-500',
    text: 'text-petrol-950 font-medium',
    label: 'Operational Context',
    icon: <MapPin className="w-3 h-3 text-petrol-700" />,
  },
};

export const EvidenceHighlighter: React.FC<EvidenceHighlighterProps> = ({
  text,
  evidenceList,
  onSelectEvidence,
  selectedEvidenceId,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<ExtractedEvidence | null>(null);

  if (!evidenceList || evidenceList.length === 0) {
    return <p className="text-sm text-graphite-800 leading-relaxed font-sans">{text}</p>;
  }

  // Sort evidence by start index
  const sorted = [...evidenceList].sort((a, b) => a.startIndex - b.startIndex);

  // Split text into highlighted and plain segments
  const segments: React.ReactNode[] = [];
  let currentIndex = 0;

  sorted.forEach((item, idx) => {
    // If there is plain text before this evidence
    if (item.startIndex > currentIndex) {
      segments.push(
        <span key={`plain-${idx}`}>{text.substring(currentIndex, item.startIndex)}</span>
      );
    }

    const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.CONTEXT;
    const isSelected = selectedEvidenceId === item.id;

    segments.push(
      <span
        key={`evidence-${item.id || idx}`}
        onClick={() => onSelectEvidence && onSelectEvidence(item)}
        onMouseEnter={() => setActiveTooltip(item)}
        onMouseLeave={() => setActiveTooltip(null)}
        className={`relative inline-block cursor-pointer px-1 py-0.5 rounded transition-colors ${
          style.bg
        } ${style.border} ${style.text} ${
          isSelected ? 'ring-2 ring-petrol-600 shadow-sm' : 'hover:brightness-95'
        }`}
        title={`${style.label}: ${item.interpretation}`}
      >
        {text.substring(item.startIndex, item.endIndex)}
      </span>
    );

    currentIndex = Math.max(currentIndex, item.endIndex);
  });

  // Trailing text
  if (currentIndex < text.length) {
    segments.push(<span key="trailing">{text.substring(currentIndex)}</span>);
  }

  return (
    <div className="relative">
      <div className="text-sm text-graphite-800 leading-relaxed font-sans p-3 bg-surface-sunken/40 rounded border border-surface-border">
        {segments}
      </div>

      {/* Active hover info banner */}
      {activeTooltip && (
        <div className="mt-2.5 p-2.5 rounded bg-surface border border-surface-border-strong shadow-dropdown flex items-start gap-2.5 animate-fadeIn">
          <div className="mt-0.5 shrink-0">
            {CATEGORY_STYLES[activeTooltip.category]?.icon}
          </div>
          <div className="text-xs">
            <span className="font-semibold text-graphite-900 uppercase tracking-wide">
              {CATEGORY_STYLES[activeTooltip.category]?.label}
            </span>
            <p className="text-graphite-700 mt-0.5">{activeTooltip.interpretation}</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-surface-border text-xs text-graphite-600">
        <span className="font-medium text-graphite-500 uppercase tracking-wider text-[11px]">
          Evidence Layers:
        </span>
        {Object.entries(CATEGORY_STYLES).map(([cat, config]) => (
          <span
            key={cat}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${config.bg} ${config.text}`}
          >
            {config.icon}
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
};
