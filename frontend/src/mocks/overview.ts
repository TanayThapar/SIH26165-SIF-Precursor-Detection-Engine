import { AnalyticsOverviewData } from '../types/analytics';
import { MOCK_SITE_RANKINGS } from './rankings';
import { ALL_SAFETY_REPORTS } from './reportsData';

export const MOCK_OVERVIEW_DATA: AnalyticsOverviewData = {
  kpis: {
    totalReports: 1452,
    sifPotentialReports: 398,
    sifPotentialRate: 0.274, // 27.4%
    highHiddenRiskReports: 142, // Hidden Risk >= +3
    activeDriftAlerts: 4,
    reportsAwaitingReview: 18,
    reviewedPercentage: 92.4,
    periodLabel: 'Last 90 Days (Q3 2026)',
    comparisonWithPriorPeriod: {
      totalReportsChangePct: 8.5,
      sifRateChangePct: -2.1,
      driftAlertsChange: 1,
    }
  },
  timeSeries: [
    { date: 'Jul 05', totalVolume: 104, sifCount: 26, rawSifRate: 0.250, smoothedRate: 0.248, driftThreshold: 0.32 },
    { date: 'Jul 12', totalVolume: 112, sifCount: 29, rawSifRate: 0.258, smoothedRate: 0.252, driftThreshold: 0.32 },
    { date: 'Jul 19', totalVolume: 98, sifCount: 24, rawSifRate: 0.244, smoothedRate: 0.249, driftThreshold: 0.32 },
    { date: 'Jul 26', totalVolume: 120, sifCount: 31, rawSifRate: 0.258, smoothedRate: 0.255, driftThreshold: 0.32 },
    { date: 'Aug 02', totalVolume: 115, sifCount: 30, rawSifRate: 0.260, smoothedRate: 0.258, driftThreshold: 0.32 },
    { date: 'Aug 09', totalVolume: 108, sifCount: 29, rawSifRate: 0.268, smoothedRate: 0.262, driftThreshold: 0.32 },
    { date: 'Aug 16', totalVolume: 125, sifCount: 36, rawSifRate: 0.288, smoothedRate: 0.270, driftThreshold: 0.32 },
    { date: 'Aug 23', totalVolume: 118, sifCount: 35, rawSifRate: 0.296, smoothedRate: 0.278, driftThreshold: 0.32 },
    { date: 'Aug 30', totalVolume: 130, sifCount: 44, rawSifRate: 0.338, smoothedRate: 0.295, driftThreshold: 0.32, hasDriftAnomaly: true, notes: 'Rig 04 Casing Sling & Shutter incidents triggered CUSUM drift' },
    { date: 'Sep 06', totalVolume: 122, sifCount: 39, rawSifRate: 0.319, smoothedRate: 0.302, driftThreshold: 0.32, hasDriftAnomaly: true },
    { date: 'Sep 13', totalVolume: 116, sifCount: 36, rawSifRate: 0.310, smoothedRate: 0.301, driftThreshold: 0.32 },
    { date: 'Sep 20', totalVolume: 110, sifCount: 31, rawSifRate: 0.281, smoothedRate: 0.290, driftThreshold: 0.32 },
    { date: 'Sep 27', totalVolume: 105, sifCount: 28, rawSifRate: 0.266, smoothedRate: 0.274, driftThreshold: 0.32 },
  ],
  topSites: MOCK_SITE_RANKINGS,
  lsrDistribution: [
    { rule: 'Line of Fire', count: 342, sifPotentialCount: 168, percentageOfTotal: 23.5, avgHiddenRisk: 3.2 },
    { rule: 'Safe Mechanical Lifting', count: 288, sifPotentialCount: 142, percentageOfTotal: 19.8, avgHiddenRisk: 3.6 },
    { rule: 'Bypassing Safety Controls', count: 245, sifPotentialCount: 126, percentageOfTotal: 16.8, avgHiddenRisk: 4.1 },
    { rule: 'Energy Isolation', count: 198, sifPotentialCount: 94, percentageOfTotal: 13.6, avgHiddenRisk: 3.8 },
    { rule: 'Working at Height', count: 182, sifPotentialCount: 88, percentageOfTotal: 12.5, avgHiddenRisk: 3.9 },
    { rule: 'Hot Work', count: 124, sifPotentialCount: 52, percentageOfTotal: 8.5, avgHiddenRisk: 3.1 },
    { rule: 'Confined Space', count: 86, sifPotentialCount: 46, percentageOfTotal: 5.9, avgHiddenRisk: 4.3 },
    { rule: 'Driving', count: 98, sifPotentialCount: 38, percentageOfTotal: 6.7, avgHiddenRisk: 2.8 },
    { rule: 'Work Authorization', count: 165, sifPotentialCount: 71, percentageOfTotal: 11.3, avgHiddenRisk: 3.4 },
  ],
  barrierFailures: [
    { state: 'Bypassed', count: 428, percentage: 38.2, description: 'Interlocks circumvented, PPE omitted, or permit shortcuts taken' },
    { state: 'Failed', count: 362, percentage: 32.3, description: 'Engineered hardware or physical containment broke down under operating stress' },
    { state: 'Missing', count: 214, percentage: 19.1, description: 'Required barrier or gas check was completely absent at time of task' },
    { state: 'Held', count: 94, percentage: 8.4, description: 'Mitigating barrier held and successfully absorbed high-energy contact' },
    { state: 'Ineffective', count: 22, percentage: 2.0, description: 'Barrier engaged but lacked rating or physical capacity to contain energy' },
  ],
  provenance: {
    source: 'OIL Safety Analytics Pipeline (Synthetic Demonstration Set)',
    synthetic: true,
    labelSource: 'synthetic',
  }
};
