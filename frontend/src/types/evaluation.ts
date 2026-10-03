import { LifeSavingRule } from './report';

export type ModelVariant =
  | 'TF-IDF + Logistic Regression'
  | 'Outcome-Aware DeBERTa'
  | 'Outcome-Blind Multitask (Ours)'
  | 'Neuro-Symbolic Engine (Final)';

export interface ModelPerformanceMetric {
  variant: ModelVariant;
  precision: number;
  recall: number;
  f1: number;
  prAuc: number;
  rocAuc: number;
  brierScore: number;
  expectedCalibrationError: number;
  outcomeBiasLeakagePct: number; // percentage of predictions influenced by outcome phrasing
  trainingStatus: 'trained' | 'evaluating' | 'not_trained';
  evalDataset: string;
}

export interface CalibrationBucket {
  binConfidence: number; // e.g. 0.1, 0.2, ... 1.0
  actualAccuracy: number; // empirical accuracy in bin
  sampleCount: number;
}

export interface PrecisionRecallPoint {
  recall: number;
  precision: number;
  threshold: number;
}

export interface ConfusionMatrixData {
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
  totalEvaluated: number;
}

export interface LsrEvaluationMetric {
  rule: LifeSavingRule;
  precision: number;
  recall: number;
  f1: number;
  support: number;
}

export interface ModelEvaluationSummary {
  isModelTrained: boolean;
  statusMessage?: string;
  lastTrainedDate?: string;
  testSetSize: number;
  models: ModelPerformanceMetric[];
  calibrationData: Record<ModelVariant, CalibrationBucket[]>;
  prCurves: Record<ModelVariant, PrecisionRecallPoint[]>;
  confusionMatrices: Record<ModelVariant, ConfusionMatrixData>;
  lsrMetrics: LsrEvaluationMetric[];
  outcomeBlindAblation: {
    unmaskedF1: number;
    maskedF1: number;
    outcomePhraseRelianceDropPct: number;
    description: string;
  };
}
