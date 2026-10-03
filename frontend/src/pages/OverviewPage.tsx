import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  Crosshair,
  Activity,
  CheckSquare,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { fetchOverviewAnalytics, fetchHiddenRiskReports } from '../services';
import { AnalyticsOverviewData } from '../types/analytics';
import { SafetyReport } from '../types/report';
import { MetricCard } from '../components/ui/MetricCard';
import { HiddenRiskIndicator } from '../components/ui/HiddenRiskIndicator';
import { useReportDrawer } from '../context/DrawerContext';
import { useGlobalFilters } from '../context/FilterContext';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { filters, updateFilter } = useGlobalFilters();
  const { openReport } = useReportDrawer();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsOverviewData | null>(null);
  const [watchlist, setWatchlist] = useState<SafetyReport[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [overviewRes, hiddenReports] = await Promise.all([
          fetchOverviewAnalytics(filters),
          fetchHiddenRiskReports(filters),
        ]);
        if (isMounted) {
          setData(overviewRes);
          setWatchlist(hiddenReports.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load overview data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-3">
        <div className="w-8 h-8 border-2 border-petrol-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-graphite-500 font-medium">
          Loading executive safety intelligence across Oil India assets...
        </span>
      </div>
    );
  }

  const { kpis, timeSeries, topSites, lsrDistribution, barrierFailures } = data;

  return (
    <div className="space-y-6">
      {/* KPI STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <MetricCard
          label="Total Reports Analyzed"
          value={kpis.totalReports.toLocaleString()}
          subtitle="Q3 2026 Rolling"
          change={{
            value: kpis.comparisonWithPriorPeriod.totalReportsChangePct,
            suffix: '%',
            isPositiveGood: true,
            periodLabel: 'prior Q2',
          }}
          icon={<FileText className="w-4 h-4 text-graphite-400" />}
          accentColor="graphite"
        />

        <MetricCard
          label="SIF Precursor Volume"
          value={kpis.sifPotentialReports.toLocaleString()}
          subtitle={`Precursor Rate: ${(kpis.sifPotentialRate * 100).toFixed(1)}%`}
          change={{
            value: kpis.comparisonWithPriorPeriod.sifRateChangePct,
            suffix: '%',
            isPositiveGood: false,
            periodLabel: 'prior Q2',
          }}
          icon={<AlertTriangle className="w-4 h-4 text-signal-600" />}
          accentColor="signal"
          onClick={() => navigate('/hidden-risk')}
        />

        <MetricCard
          label="High Hidden-Risk Events"
          value={kpis.highHiddenRiskReports}
          subtitle="Discrepancy (Δ ≥ +3)"
          icon={<Crosshair className="w-4 h-4 text-amber-600" />}
          accentColor="amber"
          onClick={() => navigate('/hidden-risk')}
        />

        <MetricCard
          label="Active Drift Signals"
          value={kpis.activeDriftAlerts}
          subtitle="CUSUM Change-Points"
          icon={<Activity className="w-4 h-4 text-signal-600" />}
          accentColor="signal"
          onClick={() => navigate('/drift')}
        />

        <MetricCard
          label="Awaiting HSE Review"
          value={kpis.reportsAwaitingReview}
          subtitle={`${kpis.reviewedPercentage}% Queue Cleared`}
          icon={<CheckSquare className="w-4 h-4 text-petrol-600" />}
          accentColor="petrol"
          onClick={() => navigate('/triage')}
        />
      </div>

      {/* PRIMARY VISUAL: SIF RATE OVER TIME WITH DRIFT MARKERS */}
      <div className="bg-surface rounded-lg border border-surface-border p-5 shadow-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-graphite-800">
                SIF Precursor Rate Trend Over Time
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-petrol-50 text-petrol-800 border border-petrol-200 font-semibold">
                Weekly Aggregated
              </span>
            </div>
            <p className="text-xs text-graphite-500 mt-0.5">
              Proportion of reports possessing fatal/life-altering hazard geometry despite harmless outcomes
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-petrol-600 inline-block" />
              <span className="text-graphite-600">Smoothed Rate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-signal-500 inline-block" />
              <span className="text-graphite-600">CUSUM Anomaly Trigger</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-signal-400 inline-block" />
              <span className="text-graphite-600">Threshold (32%)</span>
            </div>
          </div>
        </div>

        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sifGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#228285" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#228285" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E6EB" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={{ stroke: '#DCE1E7' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                domain={[0.15, 0.4]}
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="bg-graphite-950 text-white text-xs p-3 rounded shadow-dropdown border border-graphite-800 space-y-1">
                      <div className="font-bold border-b border-graphite-800 pb-1 text-slate-200">
                        Week of {label}
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Total Reports:</span>
                        <span className="font-mono font-bold text-white">{item.totalVolume}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">SIF Precursors:</span>
                        <span className="font-mono font-bold text-signal-400">{item.sifCount}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Precursor Rate:</span>
                        <span className="font-mono font-bold text-petrol-300">
                          {(item.rawSifRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      {item.hasDriftAnomaly && (
                        <div className="pt-1 text-[11px] text-amber-300 flex items-center gap-1 font-semibold">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          Statistical Change Point Triggered
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <ReferenceLine
                y={0.32}
                stroke="#DC2626"
                strokeDasharray="4 4"
                label={{
                  value: 'Drift Threshold (32%)',
                  fill: '#DC2626',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Area
                type="monotone"
                dataKey="smoothedRate"
                stroke="#228285"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#sifGradient)"
              />
              <Line
                type="monotone"
                dataKey="rawSifRate"
                stroke="#64748B"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.hasDriftAnomaly) {
                    return (
                      <circle
                        key={props.key}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill="#DC2626"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                    );
                  }
                  return <circle key={props.key} cx={cx} cy={cy} r={2} fill="#64748B" />;
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TWO COLUMN GRID: SITE RISK SHRINKAGE & HIDDEN RISK WATCHLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SITE RISK (EMPIRICAL BAYES SHRINKAGE) */}
        <div className="bg-surface rounded-lg border border-surface-border p-5 shadow-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-graphite-800">
                    Site Risk Ranking (Shrinkage-Adjusted)
                  </span>
                  <span
                    className="cursor-pointer text-graphite-400 hover:text-petrol-700"
                    title="Empirical Bayes shrinkage pulls small sample size sites (e.g. n < 20) toward the global mean (24%) to prevent over-reacting to statistical noise."
                  >
                    <Info className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-xs text-graphite-500 mt-0.5">
                  Adjusted vs raw SIF precursor rates per asset
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/risk-ranking')}
                className="text-xs text-petrol-700 hover:text-petrol-900 font-semibold flex items-center gap-1"
              >
                All Sites <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-surface-border text-xs">
              {topSites.slice(0, 4).map((site) => (
                <div
                  key={site.siteId}
                  onClick={() => {
                    updateFilter('site', site.siteName);
                    navigate('/risk-ranking');
                  }}
                  className="py-3 flex items-center justify-between hover:bg-surface-sunken/50 px-2 rounded cursor-pointer transition-colors group"
                >
                  <div className="min-w-0 pr-3">
                    <span className="font-semibold text-graphite-900 group-hover:text-petrol-700 transition-colors block truncate">
                      {site.siteName}
                    </span>
                    <span className="text-[11px] text-graphite-500 flex items-center gap-2 mt-0.5">
                      <span>{site.division}</span>
                      <span>•</span>
                      <span className="font-mono">n = {site.totalReports}</span>
                      <span className="px-1.5 py-0.2 rounded bg-surface-sunken border text-[10px]">
                        {site.sampleSizeTier}
                      </span>
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-baseline justify-end gap-1.5 font-mono">
                      <span className="text-sm font-bold text-graphite-900">
                        {(site.shrinkageAdjustedRate * 100).toFixed(1)}%
                      </span>
                      <span className="text-[11px] text-graphite-400 line-through">
                        {(site.rawPrecursorRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-[10px] text-graphite-500">
                      Dominant: {site.dominantLsr}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-surface-border text-[11px] text-graphite-500 flex items-center gap-2 bg-surface-sunken/40 p-2 rounded">
            <Info className="w-3.5 h-3.5 text-petrol-700 shrink-0" />
            <span>
              Low sample size sites are adjusted toward the global prior mean (24.0%) to prevent false-alarm prioritization.
            </span>
          </div>
        </div>

        {/* HIDDEN RISK WATCHLIST */}
        <div className="bg-surface rounded-lg border border-surface-border p-5 shadow-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-graphite-800">
                  Hidden Risk Priority Watchlist
                </span>
                <p className="text-xs text-graphite-500 mt-0.5">
                  Harmless observed outcomes with severe or fatal precursor potential
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/hidden-risk')}
                className="text-xs text-petrol-700 hover:text-petrol-900 font-semibold flex items-center gap-1"
              >
                Full Watchlist <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {watchlist.map((report) => (
                <div
                  key={report.id}
                  onClick={() => openReport(report)}
                  className="p-3 bg-surface-sunken/40 hover:bg-surface-sunken rounded border border-surface-border transition-all cursor-pointer group hover:border-surface-border-strong hover:shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-graphite-900 group-hover:text-petrol-700 transition-colors">
                        {report.id}
                      </span>
                      <span className="text-[11px] text-graphite-500 truncate max-w-[140px]">
                        {report.site}
                      </span>
                    </div>
                    <HiddenRiskIndicator hiddenRisk={report.hiddenRisk} />
                  </div>

                  <p className="text-xs text-graphite-700 line-clamp-2 leading-relaxed">
                    {report.originalText}
                  </p>

                  <div className="mt-2 pt-2 border-t border-surface-border/60 flex items-center justify-between text-[11px] text-graphite-600">
                    <div className="flex items-center gap-2">
                      <span>Outcome: <strong className="text-slate-700">{report.actualSeverityLabel.split('—')[0]}</strong></span>
                      <span>→</span>
                      <span>Potential: <strong className="text-signal-700">{report.potentialSeverityLabel.split('—')[0]}</strong></span>
                    </div>
                    <span className="font-semibold text-petrol-700 group-hover:underline">
                      Inspect Report →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: BARRIER FAILURES & LIFE-SAVING RULES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BARRIER FAILURE BREAKDOWN */}
        <div className="bg-surface rounded-lg border border-surface-border p-5 shadow-panel">
          <div className="pb-3 border-b border-surface-border">
            <span className="text-xs font-bold uppercase tracking-wider text-graphite-800">
              Precursor Barrier Failure Modes
            </span>
            <p className="text-xs text-graphite-500 mt-0.5">
              Distribution of barrier status across flagged precursor events
            </p>
          </div>

          <div className="mt-4 space-y-3.5">
            {barrierFailures.map((bf) => (
              <div key={bf.state} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-graphite-800">{bf.state}</span>
                  <span className="font-mono text-graphite-600">
                    <strong>{bf.count}</strong> reports ({bf.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-surface-sunken h-2 rounded-full overflow-hidden border border-surface-border">
                  <div
                    className={`h-full rounded-full transition-all ${
                      bf.state === 'Bypassed'
                        ? 'bg-amber-500'
                        : bf.state === 'Failed'
                        ? 'bg-signal-600'
                        : bf.state === 'Missing'
                        ? 'bg-indigo-600'
                        : 'bg-operational-600'
                    }`}
                    style={{ width: `${bf.percentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-graphite-500 mt-1 leading-normal">
                  {bf.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* LIFE-SAVING RULE DISTRIBUTION */}
        <div className="bg-surface rounded-lg border border-surface-border p-5 shadow-panel">
          <div className="pb-3 border-b border-surface-border">
            <span className="text-xs font-bold uppercase tracking-wider text-graphite-800">
              IOGP Life-Saving Rule Precursor Concentration
            </span>
            <p className="text-xs text-graphite-500 mt-0.5">
              Fatal-potential events categorized by applicable IOGP core rule
            </p>
          </div>

          <div className="mt-4 space-y-2.5">
            {lsrDistribution.map((item) => (
              <div
                key={item.rule}
                onClick={() => {
                  updateFilter('lifeSavingRule', item.rule as any);
                  navigate('/hidden-risk');
                }}
                className="p-2 rounded hover:bg-surface-sunken cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-graphite-900">{item.rule}</span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-signal-700 font-bold">
                      {item.sifPotentialCount} SIFs
                    </span>
                    <span className="text-graphite-400">
                      avg Δ +{item.avgHiddenRisk.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-surface-sunken h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-petrol-600 h-full rounded-full"
                    style={{ width: `${(item.sifPotentialCount / 168) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
