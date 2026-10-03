import React from 'react';
import { ModelReasoning } from '../../types/report';
import { Zap, Eye, ShieldAlert, Cpu, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReasoningStackProps {
  reasoning: ModelReasoning;
  energySource?: string;
  barrierState?: string;
}

export const ReasoningStack: React.FC<ReasoningStackProps> = ({
  reasoning,
  energySource,
  barrierState,
}) => {
  const isHighEnergy = reasoning.highEnergyIdentified;
  const isExposed = reasoning.personExposed;
  const isCompromised = reasoning.barrierCompromised;

  return (
    <div className="bg-surface rounded border border-surface-border overflow-hidden">
      {/* Header */}
      <div className="bg-surface-sunken px-4 py-2.5 border-b border-surface-border flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-graphite-700 flex items-center gap-2">
          <Scale className="w-3.5 h-3.5 text-petrol-700" />
          Neuro-Symbolic Decision Rationale
        </span>
        <span className="text-xs font-mono text-graphite-500">
          Confidence: <strong className="text-graphite-900">{reasoning.modelConfidence}</strong>
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Model vs Rule Disagreement Alert */}
        {reasoning.modelRuleDisagreement && (
          <div className="p-3 rounded bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-900 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block uppercase tracking-wider text-[11px] text-amber-800">
                Model / Safety Rule Divergence Detected
              </span>
              <p className="mt-0.5">
                {reasoning.disagreementReason ||
                  'The statistical neural model and the deterministic rule layer evaluated different risk thresholds for this event. Flagged for mandatory HSE Engineer audit.'}
              </p>
            </div>
          </div>
        )}

        {/* 3 Physical Precursor Pillars */}
        <div>
          <span className="text-[11px] font-semibold text-graphite-500 uppercase tracking-wider block mb-2">
            Physical Precursor Criteria Triad
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {/* Pillar 1: High Energy */}
            <div
              className={`p-3 rounded border text-xs flex flex-col justify-between ${
                isHighEnergy
                  ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                  : 'bg-surface-sunken/40 border-surface-border text-graphite-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold uppercase tracking-wide flex items-center gap-1.5">
                  <Zap className={`w-3.5 h-3.5 ${isHighEnergy ? 'text-amber-700' : 'text-graphite-400'}`} />
                  1. High Energy
                </span>
                {isHighEnergy ? (
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                    PRESENT
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                    ABSENT
                  </span>
                )}
              </div>
              <p className="text-graphite-700 text-[11px] leading-relaxed">
                {reasoning.energyDescription || energySource || 'Gravity / Pressure / Kinetic energy present'}
              </p>
            </div>

            {/* Pillar 2: Exposure */}
            <div
              className={`p-3 rounded border text-xs flex flex-col justify-between ${
                isExposed
                  ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                  : 'bg-surface-sunken/40 border-surface-border text-graphite-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold uppercase tracking-wide flex items-center gap-1.5">
                  <Eye className={`w-3.5 h-3.5 ${isExposed ? 'text-signal-700' : 'text-graphite-400'}`} />
                  2. Line of Fire
                </span>
                {isExposed ? (
                  <span className="text-[10px] font-bold bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded">
                    EXPOSED
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                    SECURED
                  </span>
                )}
              </div>
              <p className="text-graphite-700 text-[11px] leading-relaxed">
                {reasoning.exposureDescription || 'Personnel in direct line of fire / drop radius'}
              </p>
            </div>

            {/* Pillar 3: Barrier Condition */}
            <div
              className={`p-3 rounded border text-xs flex flex-col justify-between ${
                isCompromised
                  ? 'bg-indigo-50/60 border-indigo-200 text-indigo-950'
                  : 'bg-surface-sunken/40 border-surface-border text-graphite-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldAlert
                    className={`w-3.5 h-3.5 ${isCompromised ? 'text-indigo-700' : 'text-graphite-400'}`}
                  />
                  3. Barrier State
                </span>
                {isCompromised ? (
                  <span className="text-[10px] font-bold bg-indigo-200 text-indigo-900 px-1.5 py-0.2 rounded">
                    COMPROMISED
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                    HELD
                  </span>
                )}
              </div>
              <p className="text-graphite-700 text-[11px] leading-relaxed">
                {reasoning.barrierDescription || barrierState || 'Barrier breached, missing, or bypassed'}
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Layer Quantitative Score Breakdown */}
        <div className="pt-2 border-t border-surface-border">
          <span className="text-[11px] font-semibold text-graphite-500 uppercase tracking-wider block mb-2">
            Quantitative Multi-Layer Fusion
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Model Layer */}
            <div className="bg-surface-sunken/50 p-2.5 rounded border border-surface-border flex items-center justify-between">
              <div>
                <span className="text-[11px] text-graphite-500 uppercase font-medium flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-graphite-400" /> Statistical NLP Layer
                </span>
                <span className="text-sm font-bold text-graphite-800 font-mono-nums">
                  {(reasoning.learnedModelScore * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-12 bg-surface-border rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-petrol-600 h-full"
                  style={{ width: `${reasoning.learnedModelScore * 100}%` }}
                />
              </div>
            </div>

            {/* Rule Layer */}
            <div className="bg-surface-sunken/50 p-2.5 rounded border border-surface-border flex items-center justify-between">
              <div>
                <span className="text-[11px] text-graphite-500 uppercase font-medium flex items-center gap-1">
                  <Scale className="w-3 h-3 text-graphite-400" /> Symbolic Rule Layer
                </span>
                <span
                  className={`text-xs font-bold uppercase ${
                    reasoning.symbolicRuleTriggered ? 'text-signal-700' : 'text-graphite-600'
                  }`}
                >
                  {reasoning.symbolicRuleTriggered ? 'Triggered (High Energy + Exposure)' : 'Not Triggered'}
                </span>
              </div>
              <div className="shrink-0">
                {reasoning.symbolicRuleTriggered ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-signal-500 inline-block animate-ping" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-graphite-400" />
                )}
              </div>
            </div>

            {/* Combined Final SIF Score */}
            <div className="bg-petrol-50/60 p-2.5 rounded border border-petrol-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-petrol-800 uppercase font-bold">
                  Final Calibrated SIF Score
                </span>
                <span className="text-sm font-extrabold text-petrol-900 font-mono-nums">
                  {(reasoning.combinedSifScore * 100).toFixed(0)}%
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  reasoning.combinedSifScore >= 0.85
                    ? 'bg-signal-100 text-signal-800 border border-signal-300'
                    : reasoning.combinedSifScore >= 0.7
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-operational-100 text-operational-800 border border-operational-300'
                }`}
              >
                {reasoning.combinedSifScore >= 0.7 ? 'SIF PRECURSOR' : 'LOW RISK'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
