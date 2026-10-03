export type SeverityLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface SeverityDefinition {
  level: SeverityLevel;
  code: string;
  label: string;
  description: string;
  colorClass: string;
}

export const SEVERITY_LEVELS: Record<SeverityLevel, SeverityDefinition> = {
  1: { level: 1, code: 'Level I', label: 'Negligible / Near Miss', description: 'No harm or negligible property effect', colorClass: 'text-slate-600 bg-slate-100 border-slate-300' },
  2: { level: 2, code: 'Level II', label: 'Minor', description: 'First aid or minor equipment disturbance', colorClass: 'text-blue-700 bg-blue-50 border-blue-200' },
  3: { level: 3, code: 'Level III', label: 'Moderate', description: 'Medical treatment required / reversible impairment', colorClass: 'text-amber-700 bg-amber-50 border-amber-200' },
  4: { level: 4, code: 'Level IV', label: 'Serious', description: 'Lost time injury / significant barrier breach', colorClass: 'text-orange-700 bg-orange-50 border-orange-300' },
  5: { level: 5, code: 'Level V', label: 'Life-Changing', description: 'Permanent partial or total disability', colorClass: 'text-rose-700 bg-rose-50 border-rose-300' },
  6: { level: 6, code: 'Level VI', label: 'Fatal Potential', description: 'Catastrophic event / single or multiple fatality potential', colorClass: 'text-signal-700 bg-signal-50 border-signal-300' },
};

export type EnergySourceType =
  | 'Gravity (Falling Objects / Falls)'
  | 'Motion / Vehicle Impact'
  | 'Pressure / Pressurized Fluids'
  | 'Electrical (High / Low Voltage)'
  | 'Chemical / Toxic / Flammable'
  | 'Stored Mechanical / Tension'
  | 'Thermal (Fire / Extreme Heat)'
  | 'None / Minimal';

export type BarrierState = 'Held' | 'Failed' | 'Bypassed' | 'Missing' | 'Ineffective';
export type BarrierType = 'Engineering' | 'Procedural' | 'Human / Operational' | 'PPE';

export type LifeSavingRule =
  | 'Bypassing Safety Controls'
  | 'Confined Space'
  | 'Driving'
  | 'Energy Isolation'
  | 'Hot Work'
  | 'Line of Fire'
  | 'Safe Mechanical Lifting'
  | 'Work Authorization'
  | 'Working at Height'
  | 'None / Non-LSR';

export type ReviewStatus =
  | 'auto_escalated'
  | 'review_required'
  | 'reviewed_correct'
  | 'reviewed_corrected'
  | 'dismissed';

export type DatasetProvenanceType =
  | 'synthetic'
  | 'proxy'
  | 'weakly_supervised'
  | 'gold'
  | 'manual'
  | 'backend_live';

export type EvidenceCategory = 'ENERGY' | 'EXPOSURE' | 'BARRIER' | 'OUTCOME' | 'CONTEXT';
export type ExtractedEvidence = EvidenceSpan;
export type ModelReasoning = ExplainableReasoning;

export interface EvidenceSpan {
  id: string;
  category: EvidenceCategory;
  text: string;
  startIndex: number;
  endIndex: number;
  interpretation: string;
  severityInfluence: 'increases_potential' | 'decreases_potential' | 'neutral' | 'outcome_leakage';
}

export interface ExposureDetails {
  personExposed: boolean;
  lineOfFire: boolean;
  hazardZone: boolean;
  distance?: string;
  duration?: string;
  peopleCount?: number;
}

export interface BarrierDetails {
  state: BarrierState;
  type: BarrierType;
  identifiedBarrier: string;
  secondaryBarrier?: string;
}

export interface ExplainableReasoning {
  highEnergyIdentified: boolean;
  energyDescription: string;
  personExposed: boolean;
  exposureDescription: string;
  barrierCompromised: boolean;
  barrierDescription: string;
  learnedModelScore: number;
  symbolicRuleTriggered: boolean;
  combinedSifScore: number;
  modelConfidence: 'High' | 'Moderate' | 'Low';
  modelRuleDisagreement: boolean;
  disagreementType?: 'MODEL_HIGH_RULE_LOW' | 'MODEL_LOW_RULE_HIGH';
  disagreementReason?: string;
}

export interface SafetyReport {
  id: string;
  date: string;
  site: string;
  plant?: string;
  location?: string;
  activity: string;
  equipment?: string;
  
  originalText: string;
  maskedText: string;
  outcomePhraseRemoved: string;

  actualSeverity: SeverityLevel;
  actualSeverityLabel: string;
  potentialSeverity: SeverityLevel;
  potentialSeverityLabel: string;

  // Signature Metric: Hidden Risk = Potential - Actual
  hiddenRisk: number;

  sifProbability: number; // 0.00 to 1.00
  sifFlag: boolean;
  riskBand: 'Critical SIF' | 'High SIF' | 'Medium SIF' | 'Low / Non-SIF';

  lifeSavingRules: LifeSavingRule[];
  energySource: EnergySourceType;
  exposure: ExposureDetails;
  barrier: BarrierDetails;

  evidence: EvidenceSpan[];
  reasoning: ExplainableReasoning;

  reviewStatus: ReviewStatus;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;

  provenance: {
    source: string;
    synthetic: boolean;
    labelSource: DatasetProvenanceType;
  };
}

export interface AnalysisRequestPayload {
  reportText: string;
  site?: string;
  activity?: string;
  equipment?: string;
  loggedSeverity?: SeverityLevel;
}

export interface AnalysisResponseResult {
  report: SafetyReport;
  latencyMs: number;
  modelVersion: string;
  pipelineStages: {
    normalizationMs: number;
    maskingMs: number;
    extractionMs: number;
    multitaskMs: number;
    neuroSymbolicMs: number;
  };
}
