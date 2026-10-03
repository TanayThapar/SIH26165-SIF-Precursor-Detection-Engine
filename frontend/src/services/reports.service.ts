import { getApiClient } from '../api/client';
import { SafetyReport, AnalysisRequestPayload, AnalysisResponseResult } from '../types/report';
import { GlobalFilterState } from '../types/filters';

export async function fetchReports(filters?: GlobalFilterState): Promise<SafetyReport[]> {
  return getApiClient().getReports(filters);
}

export async function fetchReportById(id: string): Promise<SafetyReport> {
  return getApiClient().getReportById(id);
}

export async function analyzeSafetyReport(payload: AnalysisRequestPayload): Promise<AnalysisResponseResult> {
  return getApiClient().analyzeReport(payload);
}

export async function fetchHiddenRiskReports(filters?: GlobalFilterState): Promise<SafetyReport[]> {
  return getApiClient().getHiddenRiskReports(filters);
}
