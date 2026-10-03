import { getApiClient } from '../api/client';
import { DriftAlert, DriftWeeklyTimeSeries } from '../types/drift';
import { GlobalFilterState } from '../types/filters';

export async function fetchDriftAlerts(filters?: GlobalFilterState): Promise<DriftAlert[]> {
  return getApiClient().getDriftAlerts(filters);
}

export async function fetchDriftTimeSeries(alertId?: string): Promise<DriftWeeklyTimeSeries[]> {
  return getApiClient().getDriftTimeSeries(alertId);
}

export async function updateDriftAlertStatus(
  alertId: string,
  status: DriftAlert['status'],
  acknowledgedBy?: string
): Promise<DriftAlert> {
  return getApiClient().updateDriftStatus(alertId, status, acknowledgedBy);
}
