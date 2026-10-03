import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';

interface OutcomeMaskingDiffProps {
  originalText: string;
  maskedText: string;
  outcomePhraseRemoved?: string;
}

export const OutcomeMaskingDiff: React.FC<OutcomeMaskingDiffProps> = ({
  originalText,
  maskedText,
  outcomePhraseRemoved,
}) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'stacked' | 'toggle'>('side-by-side');
  const [activeToggle, setActiveToggle] = useState<'blind' | 'original'>('blind');

  return (
    <div className="bg-surface rounded border border-surface-border overflow-hidden">
      {/* Header bar with controls */}
      <div className="bg-surface-sunken px-4 py-2.5 border-b border-surface-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-petrol-600"></div>
          <span className="text-xs font-semibold uppercase tracking-wider text-graphite-700">
            Outcome-Blind Representation (Bias Decoupling)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded border border-surface-border bg-surface p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'side-by-side'
                  ? 'bg-petrol-700 text-white font-medium shadow-sm'
                  : 'text-graphite-600 hover:text-graphite-900'
              }`}
            >
              Side-by-Side
            </button>
            <button
              type="button"
              onClick={() => setViewMode('stacked')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'stacked'
                  ? 'bg-petrol-700 text-white font-medium shadow-sm'
                  : 'text-graphite-600 hover:text-graphite-900'
              }`}
            >
              Stacked
            </button>
            <button
              type="button"
              onClick={() => setViewMode('toggle')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'toggle'
                  ? 'bg-petrol-700 text-white font-medium shadow-sm'
                  : 'text-graphite-600 hover:text-graphite-900'
              }`}
            >
              Toggle Lens
            </button>
          </div>
        </div>
      </div>

      {/* Outcome removal badge callout */}
      {outcomePhraseRemoved && (
        <div className="bg-amber-50/70 border-b border-amber-200 px-4 py-2 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>
              <strong className="font-semibold">Decoupled Outcome Bias Token:</strong>{' '}
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-950 font-medium">
                "{outcomePhraseRemoved}"
              </span>
            </span>
          </div>
          <span className="text-[11px] text-amber-800">
            Masked from model attention to prevent false-negative safety bias
          </span>
        </div>
      )}

      {/* Content depending on viewMode */}
      <div className="p-4">
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Text */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-surface-border">
                <span className="text-xs font-semibold text-graphite-500 uppercase flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-graphite-400" />
                  Original Report As Logged
                </span>
                <span className="text-[11px] font-mono text-graphite-500">Unfiltered Text</span>
              </div>
              <div className="p-3.5 rounded bg-surface-sunken/60 border border-surface-border text-sm text-graphite-800 leading-relaxed font-sans min-h-[100px]">
                {originalText}
              </div>
            </div>

            {/* Outcome-Blind Model Text */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-surface-border">
                <span className="text-xs font-semibold text-petrol-700 uppercase flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-petrol-600" />
                  Outcome-Blind Representation
                </span>
                <span className="text-[11px] font-mono text-petrol-700 bg-petrol-50 px-1.5 py-0.5 rounded border border-petrol-200">
                  Model Input Space
                </span>
              </div>
              <div className="p-3.5 rounded bg-petrol-50/30 border border-petrol-200 text-sm text-graphite-900 leading-relaxed font-sans min-h-[100px]">
                {maskedText.split(/(\[OUTCOME(?: REMOVED)?\])/).map((part, i) =>
                  part.includes('[OUTCOME') ? (
                    <span
                      key={i}
                      className="inline-flex items-center font-mono font-semibold px-2 py-0.5 mx-1 rounded bg-amber-200/90 text-amber-950 border border-amber-400 text-xs shadow-sm animate-pulse"
                      title="Outcome phrase stripped: forces model to evaluate precursor hazard severity without hindsight bias."
                    >
                      [OUTCOME TOKEN MASKED]
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'stacked' && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-graphite-500 uppercase mb-1.5 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-graphite-400" /> Original Report
              </div>
              <div className="p-3 rounded bg-surface-sunken/50 border border-surface-border text-sm text-graphite-800">
                {originalText}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-petrol-700 uppercase mb-1.5 flex items-center gap-1">
                <EyeOff className="w-3.5 h-3.5 text-petrol-600" /> Outcome-Blind Representation
              </div>
              <div className="p-3 rounded bg-petrol-50/40 border border-petrol-200 text-sm text-graphite-900">
                {maskedText.split(/(\[OUTCOME(?: REMOVED)?\])/).map((part, i) =>
                  part.includes('[OUTCOME') ? (
                    <span
                      key={i}
                      className="font-mono font-semibold px-2 py-0.5 mx-1 rounded bg-amber-200 text-amber-950 border border-amber-400 text-xs"
                    >
                      [OUTCOME TOKEN MASKED]
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'toggle' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-graphite-600">
                Toggle between human hindsight perception vs outcome-blind AI model perception:
              </span>
              <div className="inline-flex rounded border border-surface-border p-0.5 bg-surface text-xs">
                <button
                  type="button"
                  onClick={() => setActiveToggle('blind')}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeToggle === 'blind'
                      ? 'bg-petrol-700 text-white font-medium'
                      : 'text-graphite-600 hover:text-graphite-900'
                  }`}
                >
                  Outcome-Blind Lens
                </button>
                <button
                  type="button"
                  onClick={() => setActiveToggle('original')}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeToggle === 'original'
                      ? 'bg-graphite-800 text-white font-medium'
                      : 'text-graphite-600 hover:text-graphite-900'
                  }`}
                >
                  Raw Logged Lens
                </button>
              </div>
            </div>

            <div
              className={`p-4 rounded border text-sm leading-relaxed transition-all ${
                activeToggle === 'blind'
                  ? 'bg-petrol-50/30 border-petrol-300 text-graphite-900'
                  : 'bg-surface-sunken/60 border-surface-border text-graphite-800'
              }`}
            >
              {activeToggle === 'blind' ? (
                maskedText.split(/(\[OUTCOME(?: REMOVED)?\])/).map((part, i) =>
                  part.includes('[OUTCOME') ? (
                    <span
                      key={i}
                      className="font-mono font-semibold px-2 py-0.5 mx-1 rounded bg-amber-200 text-amber-950 border border-amber-400 text-xs"
                    >
                      [OUTCOME TOKEN MASKED]
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )
              ) : (
                originalText
              )}
            </div>
          </div>
        )}

        <div className="mt-3 flex items-start gap-2 text-xs text-graphite-500 bg-surface-sunken/30 p-2.5 rounded border border-surface-border/60">
          <AlertCircle className="w-3.5 h-3.5 text-petrol-700 shrink-0 mt-0.5" />
          <span>
            <strong>The Absence of Injury Principle:</strong> Real oilfield incidents frequently state "No injury occurred" or "Worker stepped away in time". When naive NLP models read these phrases, they lower the risk score. Our outcome-blind layer excises the outcome clause so potential severity is assessed solely from the physical hazard geometry.
          </span>
        </div>
      </div>
    </div>
  );
};
