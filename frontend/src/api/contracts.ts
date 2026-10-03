import {
  SafetyReport,
  AnalysisRequestPayload,
  AnalysisResponseResult,
} from '../types/report';
import {
  AnalyticsOverviewData,
  SiteRiskRanking,
  ActivityRiskRanking,
} from '../types/analytics';
import { DriftAlert, DriftWeeklyTimeSeries } from '../types/drift';
import { PrecursorGraphData } from '../types/graph';
import { ModelEvaluationSummary } from '../types/evaluation';
import { GlobalFilterState } from '../types/filters';

export interface ReviewerFeedbackPayload {
  reportId: string;
  action: 'confirm' | 'correct' | 'escalate' | 'dismiss';
  reviewerName: string;
  notes: string;
  correctedValues?: {
    sifFlag?: boolean;
    potentialSeverity?: number;
    lifeSavingRules?: string[];
    energySource?: string;
    barrierState?: string;
  };
}

export interface IApiClient {
  getOverview(filters?: GlobalFilterState): Promise<AnalyticsOverviewData>;
  getReports(filters?: GlobalFilterState): Promise<SafetyReport[]>;
  getReportById(id: string): Promise<SafetyReport>;
  analyzeReport(payload: AnalysisRequestPayload): Promise<AnalysisResponseResult>;
  getSiteRankings(filters?: GlobalFilterState): Promise<SiteRiskRanking[]>;
  getActivityRankings(filters?: GlobalFilterState): Promise<ActivityRiskRanking[]>;
  getHiddenRiskReports(filters?: GlobalFilterState): Promise<SafetyReport[]>;
  getPrecursorGraph(filters?: GlobalFilterState): Promise<PrecursorGraphData>;
  getDriftAlerts(filters?: GlobalFilterState): Promise<DriftAlert[]>;
  getDriftTimeSeries(alertId?: string): Promise<DriftWeeklyTimeSeries[]>;
  updateDriftStatus(alertId: string, status: DriftAlert['status'], acknowledgedBy?: string): Promise<DriftAlert>;
  getEvaluationMetrics(): Promise<ModelEvaluationSummary>;
  setEvaluationTrainedState(isTrained: boolean): Promise<ModelEvaluationSummary>;
  submitFeedback(payload: ReviewerFeedbackPayload): Promise<SafetyReport>;
}
