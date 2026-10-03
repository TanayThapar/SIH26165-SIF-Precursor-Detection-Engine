import React, { useState, useEffect } from 'react';
import { SafetyReport, SeverityLevel, SEVERITY_LEVELS } from '../../types/report';
import { SeverityIndicator } from '../ui/SeverityIndicator';
import { HiddenRiskIndicator } from '../ui/HiddenRiskIndicator';
import { RiskBadge } from '../ui/RiskBadge';
import { StatusBadge } from '../ui/StatusBadge';
import { DatasetProvenanceBadge } from '../ui/DatasetProvenanceBadge';
import { LifeSavingRuleTags } from '../ui/LifeSavingRuleTags';
import { OutcomeMaskingDiff } from '../ui/OutcomeMaskingDiff';
import { EvidenceHighlighter } from '../ui/EvidenceHighlighter';
import { ReasoningStack } from '../ui/ReasoningStack';
import { submitReviewerFeedback } from '../../services';
import {
  X,
  Calendar,
  MapPin,
  Wrench,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface ReportDrawerProps {
  report: SafetyReport | null;
  isOpen: boolean;
  onClose: () => void;
  onReportUpdated?: (updatedReport: SafetyReport) => void;
}

export const ReportDrawer: React.FC<ReportDrawerProps> = ({
  report,
  isOpen,
  onClose,
  onReportUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'review'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Review Form States
  const [correctedSeverity, setCorrectedSeverity] = useState<SeverityLevel>(
    report?.potentialSeverity || 6
  );
  const [correctedSifFlag, setCorrectedSifFlag] = useState<boolean>(
    report?.sifFlag ?? true
  );
  const [reviewerNotes, setReviewerNotes] = useState<string>('');

  // Sync state when report changes (official React pattern for deriving state from props)
  const [prevReportId, setPrevReportId] = useState<string | null>(null);
  if (report && report.id !== prevReportId) {
    setPrevReportId(report.id);
    setCorrectedSeverity(report.potentialSeverity);
    setCorrectedSifFlag(report.sifFlag);
    setReviewerNotes('');
    setFeedbackSuccess(null);
  }

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !report) return null;

  const handleReviewAction = async (
    action: 'confirm' | 'correct' | 'escalate' | 'dismiss'
  ) => {
    setIsSubmitting(true);
    try {
      const updated = await submitReviewerFeedback({
        reportId: report.id,
        action,
        notes: reviewerNotes || `Action: ${action} submitted via Report Drawer`,
        correctedValues:
          action === 'correct'
            ? {
                potentialSeverity: correctedSeverity,
                sifFlag: correctedSifFlag,
              }
            : undefined,
        reviewerName: 'OIL HSE Officer (Current Session)',
      });

      setFeedbackSuccess(`Report status updated to: ${action.toUpperCase()}`);
      if (onReportUpdated) {
        onReportUpdated(updated);
      }
      setTimeout(() => {
        setFeedbackSuccess(null);
      }, 3500);
    } catch (err) {
      console.error('Failed to submit reviewer feedback', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-graphite-950/40 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-3xl bg-surface border-l border-surface-border shadow-dropdown flex flex-col animate-slideInRight">
          {/* Top Header Bar */}
          <div className="p-4 bg-surface-raised border-b border-surface-border flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-base font-bold text-graphite-950">
                  {report.id}
                </span>
                <StatusBadge status={report.reviewStatus} />
                <DatasetProvenanceBadge sourceType={report.provenance.labelSource} />
              </div>

              <div className="mt-2 flex items-center gap-4 text-xs text-graphite-600 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-graphite-800">
                  <MapPin className="w-3.5 h-3.5 text-petrol-700" />
                  {report.site} {report.location ? `• ${report.location}` : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-graphite-400" />
                  {report.activity}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-graphite-400" />
                  {report.date}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-graphite-400 hover:text-graphite-700 hover:bg-surface-sunken transition-colors"
              title="Close Drawer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-4 border-b border-surface-border bg-surface flex gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`py-2.5 border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-petrol-700 text-petrol-800'
                  : 'border-transparent text-graphite-500 hover:text-graphite-800'
              }`}
            >
              Hazard & Precursor Evidence
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('review')}
              className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'review'
                  ? 'border-petrol-700 text-petrol-800'
                  : 'border-transparent text-graphite-500 hover:text-graphite-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              HSE Triage & Review
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {feedbackSuccess && (
              <div className="p-3 bg-operational-50 border border-operational-300 rounded text-xs text-operational-800 flex items-center gap-2 animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-operational-600 shrink-0" />
                <span>{feedbackSuccess}</span>
              </div>
            )}

            {/* Signature Metric Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-surface-sunken/40 p-3 rounded-lg border border-surface-border">
              {/* Actual Severity */}
              <div className="p-2.5 bg-surface rounded border border-surface-border">
                <span className="text-[11px] font-semibold text-graphite-500 uppercase block mb-1">
                  Observed Outcome
                </span>
                <div className="flex items-center gap-2">
                  <SeverityIndicator level={report.actualSeverity} size="sm" showLabel={false} />
                  <span className="text-xs font-bold text-graphite-800 truncate">
                    {report.actualSeverityLabel.split('—')[1] || report.actualSeverityLabel}
                  </span>
                </div>
              </div>

              {/* Potential Severity */}
              <div className="p-2.5 bg-surface rounded border border-surface-border">
                <span className="text-[11px] font-semibold text-signal-700 uppercase block mb-1">
                  Potential Severity
                </span>
                <div className="flex items-center gap-2">
                  <SeverityIndicator level={report.potentialSeverity} size="sm" showLabel={false} />
                  <span className="text-xs font-bold text-signal-900 truncate">
                    {report.potentialSeverityLabel.split('—')[1] || report.potentialSeverityLabel}
                  </span>
                </div>
              </div>

              {/* Hidden Risk */}
              <div className="p-2.5 bg-surface rounded border border-surface-border">
                <span className="text-[11px] font-semibold text-graphite-500 uppercase block mb-1">
                  Hidden Risk
                </span>
                <HiddenRiskIndicator hiddenRisk={report.hiddenRisk} />
              </div>

              {/* SIF Potential Probability */}
              <div className="p-2.5 bg-surface rounded border border-surface-border">
                <span className="text-[11px] font-semibold text-graphite-500 uppercase block mb-1">
                  SIF Probability
                </span>
                <RiskBadge
                  probability={report.sifProbability}
                  riskBand={report.riskBand}
                  size="sm"
                />
              </div>
            </div>

            {activeTab === 'details' && (
              <>
                {/* Life-Saving Rules and Barrier Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface-raised rounded border border-surface-border">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase text-graphite-500 block">
                      Applicable IOGP Life-Saving Rules
                    </span>
                    <LifeSavingRuleTags rules={report.lifeSavingRules} />
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold uppercase text-graphite-500 block">
                      Barrier Condition
                    </span>
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border ${
                        report.barrier.state === 'Failed'
                          ? 'bg-signal-50 text-signal-800 border-signal-300'
                          : report.barrier.state === 'Bypassed'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : report.barrier.state === 'Missing'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                          : 'bg-operational-50 text-operational-800 border-operational-300'
                      }`}
                    >
                      {report.barrier.state} ({report.barrier.type || 'Engineering'})
                    </span>
                  </div>
                </div>

                {/* Outcome-Blind Comparison */}
                <OutcomeMaskingDiff
                  originalText={report.originalText}
                  maskedText={report.maskedText}
                  outcomePhraseRemoved={report.outcomePhraseRemoved}
                />

                {/* Semantic Evidence Highlighting */}
                <div className="bg-surface rounded border border-surface-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-graphite-700">
                      Extracted Physical Evidence Layers
                    </span>
                    <span className="text-[11px] text-graphite-500">
                      Hover / click highlighted tokens for hazard interpretation
                    </span>
                  </div>
                  <EvidenceHighlighter
                    text={report.originalText}
                    evidenceList={report.evidence || []}
                  />
                </div>

                {/* Neuro-Symbolic Explainability Stack */}
                <ReasoningStack
                  reasoning={report.reasoning}
                  energySource={report.energySource}
                  barrierState={report.barrier.state}
                />
              </>
            )}

            {activeTab === 'review' && (
              <div className="space-y-5">
                <div className="bg-surface-raised p-4 rounded border border-surface-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-graphite-800 mb-1">
                    Human-In-The-Loop Safety Review Workflow
                  </h4>
                  <p className="text-xs text-graphite-600">
                    HSE officers validate model precursor classifications. Review decisions are recorded in the feedback loop to refine fine-tuned weights and deterministic threshold heuristics.
                  </p>
                </div>

                {/* Overwrite Potential Severity */}
                <div className="p-4 bg-surface rounded border border-surface-border space-y-3">
                  <span className="text-xs font-bold text-graphite-800 block">
                    Verify / Correct Potential Severity Level:
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {([1, 2, 3, 4, 5, 6] as SeverityLevel[]).map((level) => {
                      const def = SEVERITY_LEVELS[level];
                      const isSelected = correctedSeverity === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setCorrectedSeverity(level)}
                          className={`p-2.5 rounded text-left border text-xs transition-all ${
                            isSelected
                              ? 'bg-petrol-50 border-petrol-600 ring-2 ring-petrol-600/30'
                              : 'bg-surface-sunken/40 border-surface-border hover:bg-surface-sunken'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-graphite-900">{def.code}</span>
                            {isSelected && <CheckCircle className="w-3.5 h-3.5 text-petrol-700" />}
                          </div>
                          <span className="text-[11px] text-graphite-600 block truncate">
                            {def.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SIF Flag Checkbox */}
                <div className="p-4 bg-surface rounded border border-surface-border flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-graphite-900 block">
                      Confirmed SIF Precursor Designation
                    </span>
                    <span className="text-xs text-graphite-500">
                      Does this incident represent genuine fatal or life-altering potential?
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={correctedSifFlag}
                      onChange={(e) => setCorrectedSifFlag(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-signal-600"></div>
                  </label>
                </div>

                {/* Reviewer Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-graphite-700 block">
                    HSE Officer Audit Comments & Justification:
                  </label>
                  <textarea
                    rows={3}
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="e.g. Confirmed unclipped harness at >5m elevation. Model correctly masked lack of injury."
                    className="w-full text-xs p-3 rounded border border-surface-border bg-surface focus:outline-none focus:ring-1 focus:ring-petrol-600"
                  />
                </div>

                {/* Review Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleReviewAction('confirm')}
                    className="p-2.5 rounded bg-operational-600 hover:bg-operational-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm SIF
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleReviewAction('correct')}
                    className="p-2.5 rounded bg-petrol-700 hover:bg-petrol-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Save Correction
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleReviewAction('escalate')}
                    className="p-2.5 rounded bg-signal-600 hover:bg-signal-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Escalate to Board
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleReviewAction('dismiss')}
                    className="p-2.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Dismiss (Non-SIF)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Footer */}
          <div className="p-3 bg-surface-sunken border-t border-surface-border flex items-center justify-between text-xs text-graphite-600">
            <span>
              FaultLine • SIF Precursor Detection Engine • SIH26165
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-surface border border-surface-border rounded text-graphite-700 hover:bg-surface-raised font-medium text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
