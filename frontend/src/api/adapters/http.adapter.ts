import { IApiClient, ReviewerFeedbackPayload } from '../contracts';
import {
  SafetyReport,
  AnalysisRequestPayload,
  AnalysisResponseResult,
} from '../../types/report';
import {
  AnalyticsOverviewData,
  SiteRiskRanking,
  ActivityRiskRanking,
} from '../../types/analytics';
import { DriftAlert, DriftWeeklyTimeSeries } from '../../types/drift';
import { PrecursorGraphData } from '../../types/graph';
import { ModelEvaluationSummary } from '../../types/evaluation';
import { GlobalFilterState } from '../../types/filters';

export class HttpApiAdapter implements IApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`API Error [${response.status}] ${response.statusText}: ${errorText || url}`);
    }

    return response.json();
  }

  private buildQueryString(filters?: GlobalFilterState): string {
    if (!filters) return '';
    const params = new URLSearchParams();
    if (filters.searchQuery) params.append('q', filters.searchQuery);
    if (filters.site && filters.site !== 'ALL') params.append('site', filters.site);
    if (filters.activity && filters.activity !== 'ALL') params.append('activity', filters.activity);
    if (filters.lifeSavingRule && filters.lifeSavingRule !== 'ALL') params.append('lsr', filters.lifeSavingRule);
    if (filters.barrierState && filters.barrierState !== 'ALL') params.append('barrier', filters.barrierState);
    if (filters.reviewStatus && filters.reviewStatus !== 'ALL') params.append('status', filters.reviewStatus);
    if (filters.sifOnly) params.append('sif_only', 'true');
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  async getOverview(filters?: GlobalFilterState): Promise<AnalyticsOverviewData> {
    return this.request<AnalyticsOverviewData>(`/overview${this.buildQueryString(filters)}`);
  }

  async getReports(filters?: GlobalFilterState): Promise<SafetyReport[]> {
    return this.request<SafetyReport[]>(`/reports${this.buildQueryString(filters)}`);
  }

  async getReportById(id: string): Promise<SafetyReport> {
    return this.request<SafetyReport>(`/reports/${encodeURIComponent(id)}`);
  }

  async analyzeReport(payload: AnalysisRequestPayload): Promise<AnalysisResponseResult> {
    return this.request<AnalysisResponseResult>('/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getSiteRankings(filters?: GlobalFilterState): Promise<SiteRiskRanking[]> {
    return this.request<SiteRiskRanking[]>(`/rankings/sites${this.buildQueryString(filters)}`);
  }

  async getActivityRankings(filters?: GlobalFilterState): Promise<ActivityRiskRanking[]> {
    return this.request<ActivityRiskRanking[]>(`/rankings/activities${this.buildQueryString(filters)}`);
  }

  async getHiddenRiskReports(filters?: GlobalFilterState): Promise<SafetyReport[]> {
    return this.request<SafetyReport[]>(`/hidden-risk${this.buildQueryString(filters)}`);
  }

  async getPrecursorGraph(filters?: GlobalFilterState): Promise<PrecursorGraphData> {
    return this.request<PrecursorGraphData>(`/precursor-graph${this.buildQueryString(filters)}`);
  }

  async getDriftAlerts(filters?: GlobalFilterState): Promise<DriftAlert[]> {
    return this.request<DriftAlert[]>(`/drift${this.buildQueryString(filters)}`);
  }

  async getDriftTimeSeries(alertId?: string): Promise<DriftWeeklyTimeSeries[]> {
    const qs = alertId ? `?alertId=${encodeURIComponent(alertId)}` : '';
    return this.request<DriftWeeklyTimeSeries[]>(`/drift/timeseries${qs}`);
  }

  async updateDriftStatus(
    alertId: string,
    status: DriftAlert['status'],
    acknowledgedBy?: string
  ): Promise<DriftAlert> {
    return this.request<DriftAlert>(`/drift/${encodeURIComponent(alertId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, acknowledgedBy }),
    });
  }

  async getEvaluationMetrics(): Promise<ModelEvaluationSummary> {
    return this.request<ModelEvaluationSummary>('/evaluation');
  }

  async setEvaluationTrainedState(isTrained: boolean): Promise<ModelEvaluationSummary> {
    return this.request<ModelEvaluationSummary>('/evaluation/state', {
      method: 'POST',
      body: JSON.stringify({ isTrained }),
    });
  }

  async submitFeedback(payload: ReviewerFeedbackPayload): Promise<SafetyReport> {
    return this.request<SafetyReport>('/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
