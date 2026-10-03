import { getApiClient } from '../api/client';
import { AnalyticsOverviewData, SiteRiskRanking, ActivityRiskRanking } from '../types/analytics';
import { GlobalFilterState } from '../types/filters';

export async function fetchOverviewAnalytics(filters?: GlobalFilterState): Promise<AnalyticsOverviewData> {
  return getApiClient().getOverview(filters);
}

export async function fetchSiteRankings(filters?: GlobalFilterState): Promise<SiteRiskRanking[]> {
  return getApiClient().getSiteRankings(filters);
}

export async function fetchActivityRankings(filters?: GlobalFilterState): Promise<ActivityRiskRanking[]> {
  return getApiClient().getActivityRankings(filters);
}
