import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  Play,
  RotateCcw,
  CheckCircle,
  Send,
} from 'lucide-react';
import { analyzeSafetyReport, fetchReports, submitReviewerFeedback } from '../services';
import {
  SafetyReport,
  AnalysisResponseResult,
  SeverityLevel,
} from '../types/report';
import { SeverityIndicator } from '../components/ui/SeverityIndicator';
import { HiddenRiskIndicator } from '../components/ui/HiddenRiskIndicator';
import { RiskBadge } from '../components/ui/RiskBadge';
import { LifeSavingRuleTags } from '../components/ui/LifeSavingRuleTags';
import { OutcomeMaskingDiff } from '../components/ui/OutcomeMaskingDiff';
import { EvidenceHighlighter } from '../components/ui/EvidenceHighlighter';
import { ReasoningStack } from '../components/ui/ReasoningStack';

// Realistic sample incident templates across OIL operations
const SAMPLE_PRESETS = [
  {
    title: 'Rig 04: Casing Collar Suspended Load (Line of Fire)',
    text: 'During running of 9-5/8 inch casing at Rig 04, the air tugger winch wire rope slipped off the sheave while hoisting a 3.5-ton casing joint. The joint swung violently across the rotary table and dented the doghouse bulkhead. Two roughnecks ducked behind the drawworks console just in time. No injury occurred.',
    site: 'Duliajan Drilling Rig 04',
    activity: 'Safe Mechanical Lifting',
    loggedSeverity: 1 as SeverityLevel,
  },
  {
    title: 'Moran Compressor: High Pressure Gas Purge Line Failure',
    text: 'During depressurization of scrubber vessel V-201, operator cracked open 2-inch bypass needle valve. The valve packing failed under 1,450 PSI gas pressure, violently discharging hydrocarbon mist towards the personnel walkway. Wind blew the plume away from exhaust stack. Zero injuries or fire.',
    site: 'Moran Gas Compressor Station',
    activity: 'Energy Isolation',
    loggedSeverity: 1 as SeverityLevel,
  },
  {
    title: 'Digboi Wellsite: Confined Sump Entry without H2S Test',
    text: 'Contractor entered drainage sump basin to clear mud pump suction strainer without taking 4-gas atmosphere test or obtaining confined space permit. Pocket H2S gas detector at rim showed zero at that moment. Worker completed clearing strainer in 4 minutes and climbed out unharmed.',
    site: 'Digboi Wellsite 12',
    activity: 'Confined Space',
    loggedSeverity: 1 as SeverityLevel,
  },
  {
    title: 'Derrick Mast: Working at 14m with Unanchored Lanyard',
    text: 'Derrickman climbed to monkey board at 14 meters height to latch drill pipe stand into fingers. Full body harness was worn but safety lanyard was not clipped to inertia reel line while leaning out over mast opening. Worker balanced and returned to platform safely.',
    site: 'Duliajan Drilling Rig 04',
    activity: 'Working at Height',
    loggedSeverity: 1 as SeverityLevel,
  },
  {
    title: 'Moran MCC: 415V Switchgear Shutter Bypassed',
    text: 'Electrician opened 415V motor control center breaker compartment with screwdriver to inspect contactor coil while busbar was live without LOTO tag or insulated mat. Task was finished without electric arc or shock.',
    site: 'Moran Gas Compressor Station',
    activity: 'Energy Isolation',
    loggedSeverity: 1 as SeverityLevel,
  },
];

export const AnalyzerPage: React.FC = () => {
  const [entryMode, setEntryMode] = useState<'custom' | 'existing'>('custom');
  const [existingReports, setExistingReports] = useState<SafetyReport[]>([]);

  // Input fields
  const [reportText, setReportText] = useState(SAMPLE_PRESETS[0].text);
  const [site, setSite] = useState(SAMPLE_PRESETS[0].site);
  const [activity, setActivity] = useState(SAMPLE_PRESETS[0].activity);
  const [loggedSeverity, setLoggedSeverity] = useState<SeverityLevel>(1);

  // Execution states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponseResult | null>(null);
  const [submitFeedbackMsg, setSubmitFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchReports().then((reps) => {
      setExistingReports(reps);
    });
  }, []);

  const handleSelectPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setReportText(preset.text);
    setSite(preset.site);
    setActivity(preset.activity);
    setLoggedSeverity(preset.loggedSeverity);
    setAnalysisResult(null);
  };

  const handleSelectExisting = (reportId: string) => {
    const found = existingReports.find((r) => r.id === reportId);
    if (found) {
      setReportText(found.originalText);
      setSite(found.site);
      setActivity(found.activity);
      setLoggedSeverity(found.actualSeverity);
      setAnalysisResult({
        report: found,
        latencyMs: 142,
        modelVersion: 'v1.4.2-deberta-multitask-symbolic',
        pipelineStages: {
          normalizationMs: 12,
          maskingMs: 18,
          extractionMs: 34,
          multitaskMs: 52,
          neuroSymbolicMs: 26,
        },
      });
    }
  };

  const handleRunAnalysis = async () => {
    if (!reportText.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setSubmitFeedbackMsg(null);

    try {
      const res = await analyzeSafetyReport({
        reportText: reportText,
        site,
        activity,
        loggedSeverity,
      });
      setAnalysisResult(res);
    } catch (err) {
      console.error('Error analyzing report', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFlagForTriage = async () => {
    if (!analysisResult) return;
    try {
      await submitReviewerFeedback({
        reportId: analysisResult.report.id,
        action: 'escalate',
        notes: 'Flagged for priority HSE committee audit directly from Report Analyzer',
        reviewerName: 'HSE Analyst (Live Inspection)',
      });
      setSubmitFeedbackMsg('Report has been queued into the HSE Triage & Review Workspace.');
      setTimeout(() => setSubmitFeedbackMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-slide-up">
      {/* Input Section */}
      <div className="bg-surface rounded-lg border border-surface-border p-5 shadow-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-graphite-900 flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-petrol-700" />
              Precursor Report Inspection & NLP Analyzer
            </h2>
            <p className="text-xs text-graphite-500 mt-0.5">
              Input field near-miss or unsafe condition reports to strip outcome bias and compute true potential severity
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setEntryMode('custom')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                entryMode === 'custom'
                  ? 'bg-petrol-700 text-white shadow-xs'
                  : 'bg-surface-sunken text-graphite-600 hover:text-graphite-900'
              }`}
            >
              Custom / Presets
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('existing')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                entryMode === 'existing'
                  ? 'bg-petrol-700 text-white shadow-xs'
                  : 'bg-surface-sunken text-graphite-600 hover:text-graphite-900'
              }`}
            >
              Select Historical
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        {entryMode === 'custom' && (
          <div className="mt-4 pt-1 pb-3">
            <span className="text-[11px] font-bold text-graphite-500 uppercase tracking-wider block mb-2">
              Load Realistic OIL Operational Scenarios:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-left text-xs px-2.5 py-1.5 rounded border transition-all ${
                    reportText === preset.text
                      ? 'bg-petrol-50 text-petrol-900 border-petrol-400 font-semibold ring-1 ring-petrol-300'
                      : 'bg-surface-sunken/60 text-graphite-700 border-surface-border hover:bg-surface-sunken'
                  }`}
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Existing Report Selector */}
        {entryMode === 'existing' && (
          <div className="mt-4 pb-3">
            <label className="text-xs font-bold text-graphite-700 block mb-1.5">
              Choose from Historical Incident Database:
            </label>
            <select
              onChange={(e) => handleSelectExisting(e.target.value)}
              className="w-full text-xs p-2.5 rounded border border-surface-border bg-surface focus:outline-none focus:ring-1 focus:ring-petrol-600 font-mono"
            >
              <option value="">-- Choose Historical Safety Report --</option>
              {existingReports.map((r) => (
                <option key={r.id} value={r.id}>
                  [{r.id}] {r.site} — {r.activity} ({r.lifeSavingRules.join(', ')})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Main Text Area */}
        <div className="mt-3 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-graphite-800">
                Safety Incident Observation Text (Unsafe Act / Unsafe Condition / Near-Miss):
              </label>
              <span className="text-[11px] text-graphite-400">
                {reportText.length} characters
              </span>
            </div>
            <textarea
              rows={4}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Paste raw HSE safety report description here..."
              className="w-full text-xs p-3.5 rounded border border-surface-border bg-surface focus:outline-none focus:ring-1 focus:ring-petrol-600 font-sans leading-relaxed text-graphite-900"
            />
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-graphite-600 block mb-1">
                Asset / Facility:
              </label>
              <input
                type="text"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="e.g. Duliajan Rig 04"
                className="w-full text-xs p-2 rounded border border-surface-border bg-surface focus:outline-none focus:ring-1 focus:ring-petrol-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-graphite-600 block mb-1">
                Task / Activity:
              </label>
              <input
                type="text"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="e.g. Safe Mechanical Lifting"
                className="w-full text-xs p-2 rounded border border-surface-border bg-surface focus:outline-none focus:ring-1 focus:ring-petrol-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-graphite-600 block mb-1">
                Observed Outcome Severity:
              </label>
              <select
                value={loggedSeverity}
                onChange={(e) => setLoggedSeverity(Number(e.target.value) as SeverityLevel)}
                className="w-full text-xs p-2 rounded border border-surface-border bg-surface focus:outline-none focus:ring-1 focus:ring-petrol-600"
              >
                <option value={1}>Level I — Negligible / Near Miss (No Injury)</option>
                <option value={2}>Level II — Minor (First Aid)</option>
                <option value={3}>Level III — Moderate (Medical Treatment)</option>
              </select>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setReportText('');
                setAnalysisResult(null);
              }}
              className="text-xs text-graphite-500 hover:text-graphite-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear Text
            </button>

            <button
              type="button"
              disabled={isAnalyzing || !reportText.trim()}
              onClick={handleRunAnalysis}
              className="px-5 py-2.5 bg-petrol-700 hover:bg-petrol-800 text-white rounded text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Hazard Geometry...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Analyze Report & Detect Precursors</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ANALYSIS RESULTS PRESENTATION */}
      {analysisResult && (
        <div className="space-y-6 animate-fadeIn">
          {submitFeedbackMsg && (
            <div className="p-3 bg-operational-50 border border-operational-300 rounded text-xs text-operational-800 flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-operational-600 shrink-0" />
              <span>{submitFeedbackMsg}</span>
            </div>
          )}

          {/* SIGNATURE RESULT STRIP */}
          <div className="bg-surface rounded-lg border border-surface-border p-5 shadow-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-graphite-950">
                    Inspection ID: {analysisResult.report.id}
                  </span>
                  <RiskBadge
                    probability={analysisResult.report.sifProbability}
                    riskBand={analysisResult.report.riskBand}
                  />
                  <span className="text-[10px] font-mono text-graphite-400">
                    Inference: {analysisResult.latencyMs}ms
                  </span>
                </div>
                <p className="text-xs text-graphite-500 mt-0.5">
                  Neuro-symbolic evaluation decoupling outcome bias from physical exposure geometry
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFlagForTriage}
                  className="px-3 py-1.5 bg-surface-sunken hover:bg-surface-raised border border-surface-border rounded text-xs font-semibold text-graphite-800 flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-petrol-700" />
                  Send to Triage Queue
                </button>
              </div>
            </div>

            {/* 4 Score Metric Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="p-3 bg-surface-sunken/40 rounded border border-surface-border">
                <span className="text-[11px] font-semibold text-graphite-500 uppercase block mb-1">
                  1. Observed Outcome
                </span>
                <div className="flex items-center gap-2">
                  <SeverityIndicator
                    level={analysisResult.report.actualSeverity}
                    size="sm"
                    showLabel={false}
                  />
                  <span className="text-xs font-bold text-graphite-800">
                    {analysisResult.report.actualSeverityLabel.split('—')[1]}
                  </span>
                </div>
                <span className="text-[10px] text-graphite-500 mt-1 block">
                  Logged report injury level
                </span>
              </div>

              <div className="p-3 bg-signal-50/40 rounded border border-signal-200">
                <span className="text-[11px] font-semibold text-signal-800 uppercase block mb-1">
                  2. Potential Severity
                </span>
                <div className="flex items-center gap-2">
                  <SeverityIndicator
                    level={analysisResult.report.potentialSeverity}
                    size="sm"
                    showLabel={false}
                  />
                  <span className="text-xs font-bold text-signal-900">
                    {analysisResult.report.potentialSeverityLabel.split('—')[1]}
                  </span>
                </div>
                <span className="text-[10px] text-signal-700 mt-1 block">
                  Physical release capacity
                </span>
              </div>

              <div className="p-3 bg-surface-sunken/40 rounded border border-surface-border">
                <span className="text-[11px] font-semibold text-graphite-500 uppercase block mb-1">
                  3. Hidden Risk (Δ)
                </span>
                <HiddenRiskIndicator hiddenRisk={analysisResult.report.hiddenRisk} />
                <span className="text-[10px] text-graphite-500 mt-1 block">
                  Potential − Observed gap
                </span>
              </div>

              <div className="p-3 bg-surface-sunken/40 rounded border border-surface-border">
                <span className="text-[11px] font-semibold text-graphite-500 uppercase block mb-1">
                  4. Life-Saving Rule
                </span>
                <LifeSavingRuleTags rules={analysisResult.report.lifeSavingRules} />
                <span className="text-[10px] text-graphite-500 mt-1 block">
                  Barrier: {analysisResult.report.barrier.state}
                </span>
              </div>
            </div>
          </div>

          {/* DUAL LENS OUTCOME MASKING VIEW */}
          <OutcomeMaskingDiff
            originalText={analysisResult.report.originalText}
            maskedText={analysisResult.report.maskedText}
            outcomePhraseRemoved={analysisResult.report.outcomePhraseRemoved}
          />

          {/* SEMANTIC EVIDENCE HIGHLIGHTING */}
          <div className="bg-surface rounded-lg border border-surface-border p-5 shadow-panel">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-border">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-graphite-800">
                  Extracted Physical Evidence Layers
                </h3>
                <p className="text-xs text-graphite-500 mt-0.5">
                  Semantic tokens indicating high energy release, line-of-fire exposure, and barrier breakdown
                </p>
              </div>
            </div>

            <EvidenceHighlighter
              text={analysisResult.report.originalText}
              evidenceList={analysisResult.report.evidence || []}
            />
          </div>

          {/* NEURO-SYMBOLIC EXPLAINABILITY STACK */}
          <ReasoningStack
            reasoning={analysisResult.report.reasoning}
            energySource={analysisResult.report.energySource}
            barrierState={analysisResult.report.barrier.state}
          />
        </div>
      )}
    </div>
  );
};
