import { LifeSavingRule, BarrierState, DatasetProvenanceType } from './report';

export interface ExecutiveKpis {
  totalReports: number;
  sifPotentialReports: number;
  sifPotentialRate: number; // e.g. 0.28
  highHiddenRiskReports: number; // hidden risk >= +3
  activeDriftAlerts: number;
  reportsAwaitingReview: number;
  reviewedPercentage: number;
  periodLabel: string;
  comparisonWithPriorPeriod: {
    totalReportsChangePct: number;
    sifRateChangePct: number;
    driftAlertsChange: number;
  };
}

export interface PrecursorRateTimeSeriesPoint {
  date: string; // ISO date or week
  totalVolume: number;
  sifCount: number;
  rawSifRate: number; // 0 to 1
  smoothedRate: number;
  driftThreshold: number;
  hasDriftAnomaly?: boolean;
  notes?: string;
}

export interface SiteRiskRanking {
  siteId: string;
  siteName: string;
  division: string;
  totalReports: number;
  sifReportsCount: number;
  rawPrecursorRate: number; // sifReportsCount / totalReports
  shrinkageAdjustedRate: number; // Beta-Binomial empirical Bayes shrinkage
  confidenceInterval: [number, number]; // [lower, upper]
  dominantLsr: LifeSavingRule;
  dominantBarrierFailure: BarrierState;
  activeDriftCount: number;
  highHiddenRiskCount: number;
  sampleSizeTier: 'Robust (n > 50)' | 'Moderate (20-50)' | 'Low (n < 20)';
}

export interface ActivityRiskRanking {
  activityName: string;
  category: string;
  totalReports: number;
  sifReportsCount: number;
  rawRate: number;
  shrinkageRate: number;
  topEnergySource: string;
  topFailedBarrier: BarrierState;
  associatedLsrs: LifeSavingRule[];
}

export interface LsrDistributionItem {
  rule: LifeSavingRule;
  count: number;
  sifPotentialCount: number;
  percentageOfTotal: number;
  avgHiddenRisk: number;
}

export interface BarrierFailureDistributionItem {
  state: BarrierState;
  count: number;
  percentage: number;
  description: string;
}

export interface AnalyticsOverviewData {
  kpis: ExecutiveKpis;
  timeSeries: PrecursorRateTimeSeriesPoint[];
  topSites: SiteRiskRanking[];
  lsrDistribution: LsrDistributionItem[];
  barrierFailures: BarrierFailureDistributionItem[];
  provenance: {
    source: string;
    synthetic: boolean;
    labelSource: DatasetProvenanceType;
  };
}
