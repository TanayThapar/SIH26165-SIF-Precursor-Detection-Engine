import { LifeSavingRule, BarrierState } from './report';

export type DriftAlertSeverity = 'Critical Drift' | 'Elevated Drift' | 'Monitoring';
export type DriftAlertStatus = 'Open' | 'Acknowledged' | 'Under Review' | 'Resolved';

export interface DriftAlert {
  id: string;
  signalName: string; // e.g. "Exclusion Zone Barrier Failure Rate"
  site: string;
  unitOrPlant: string;
  activity: string;
  targetMetric: 'Barrier Failure Rate' | 'LSR Violation Frequency' | 'SIF Precursor Density';
  detectedDate: string;
  baselinePeriod: string; // e.g. "Jan-Jun 2026 Baseline"
  baselineRate: number; // e.g. 0.08 (8%)
  currentRate: number; // e.g. 0.38 (38%)
  driftPercentage: number; // +375%
  cusumStatistic: number; // CUSUM decision statistic
  thresholdValue: number;
  severity: DriftAlertSeverity;
  status: DriftAlertStatus;
  affectedBarrier?: BarrierState;
  relevantLsr?: LifeSavingRule;
  contextSummary: string;
  recommendedAction: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface DriftWeeklyTimeSeries {
  week: string; // "2026-W32"
  failureRate: number;
  baseline: number;
  cusumValue: number;
  decisionInterval: number;
  changePointDetected: boolean;
}
