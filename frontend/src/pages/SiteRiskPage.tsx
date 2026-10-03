import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Layers,
  Info,
  ArrowUpDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { fetchSiteRankings, fetchActivityRankings } from '../services';
import { SiteRiskRanking, ActivityRiskRanking } from '../types/analytics';
import { useGlobalFilters } from '../context/FilterContext';
import { useNavigate } from 'react-router-dom';

export const SiteRiskPage: React.FC = () => {
  const navigate = useNavigate();
  const { filters, updateFilter } = useGlobalFilters();

  const [siteRankings, setSiteRankings] = useState<SiteRiskRanking[]>([]);
  const [activityRankings, setActivityRankings] = useState<ActivityRiskRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sites' | 'activities'>('sites');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [sites, activities] = await Promise.all([
          fetchSiteRankings(filters),
          fetchActivityRankings(filters),
        ]);
        if (isMounted) {
          setSiteRankings(sites);
          setActivityRankings(activities);
        }
      } catch (err) {
        console.error('Error loading rankings', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-2 border-petrol-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-graphite-500 font-medium">
          Computing empirical Bayes shrinkage rankings...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* EXPLANATORY EMPIRICAL BAYES BANNER */}
      <div className="bg-petrol-900 text-white rounded-lg p-5 shadow-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded bg-petrol-800 text-petrol-200 shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Why Empirical Bayes Shrinkage for Operational Safety?
              </h2>
              <span className="text-[10px] font-mono bg-petrol-800 px-2 py-0.5 rounded text-petrol-200 border border-petrol-700">
                Prior μ = 24.0%
              </span>
            </div>
            <p className="text-xs text-petrol-200 mt-1 max-w-3xl leading-relaxed">
              Remote drilling rigs with only 5-10 reported observations can exhibit extreme raw SIF rates (e.g. 50% or 0%) purely due to small sample noise. Our Bayesian shrinkage formulation pulls low-sample estimates toward the enterprise global mean while leaving high-volume facilities unperturbed.
            </p>
          </div>
        </div>

        <div className="p-3 bg-petrol-950/60 rounded border border-petrol-800 text-xs shrink-0 font-mono space-y-1">
          <span className="text-[10px] uppercase text-petrol-400 block font-semibold">
            Shrinkage Rule:
          </span>
          <span className="text-white text-xs block">
            θ̂ = (n / (n + ν)) × ȳ + (ν / (n + ν)) × μ
          </span>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center justify-between border-b border-surface-border pb-1">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('sites')}
            className={`px-4 py-2 rounded text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'sites'
                ? 'bg-petrol-700 text-white shadow-xs'
                : 'bg-surface text-graphite-600 hover:text-graphite-900 border border-surface-border'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Asset & Facility Risk Ranking ({siteRankings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2 rounded text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'activities'
                ? 'bg-petrol-700 text-white shadow-xs'
                : 'bg-surface text-graphite-600 hover:text-graphite-900 border border-surface-border'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Operational Activity Risk ({activityRankings.length})
          </button>
        </div>

        <span className="text-xs text-graphite-500">
          Ranked by Bayesian Shrinkage Adjusted Precursor Rate
        </span>
      </div>

      {/* SITES VIEW */}
      {activeTab === 'sites' && (
        <div className="bg-surface rounded-lg border border-surface-border overflow-hidden shadow-panel">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-sunken/60 text-graphite-500 uppercase tracking-wider text-[11px] border-b border-surface-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">Asset / Facility</th>
                  <th className="py-3 px-3 font-semibold">Operating Division</th>
                  <th className="py-3 px-3 font-semibold">Volume (n)</th>
                  <th className="py-3 px-3 font-semibold">Raw Rate</th>
                  <th className="py-3 px-3 font-semibold">
                    <span className="text-petrol-800">Adjusted Rate (θ̂)</span>
                  </th>
                  <th className="py-3 px-3 font-semibold">Shrinkage Delta</th>
                  <th className="py-3 px-3 font-semibold">95% Credible Interval</th>
                  <th className="py-3 px-3 font-semibold">Dominant LSR</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border font-sans">
                {siteRankings.map((site) => {
                  const delta = site.shrinkageAdjustedRate - site.rawPrecursorRate;
                  const isPulledDown = delta < 0;
                  return (
                    <tr
                      key={site.siteId}
                      className="hover:bg-surface-sunken/40 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <span className="font-bold text-graphite-900 block group-hover:text-petrol-700">
                          {site.siteName}
                        </span>
                        <span className="font-mono text-[10px] text-graphite-400">
                          {site.siteId}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-graphite-600">{site.division}</td>
                      <td className="py-3 px-3 font-mono">
                        <strong>{site.totalReports}</strong>
                        <span className="text-[10px] text-graphite-400 block">
                          ({site.sifReportsCount} SIFs)
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-graphite-600">
                        {(site.rawPrecursorRate * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-sm text-graphite-900">
                        <div className="flex items-center gap-1.5">
                          <span>{(site.shrinkageAdjustedRate * 100).toFixed(1)}%</span>
                          {site.activeDriftCount > 0 && (
                            <span
                              className="w-2 h-2 rounded-full bg-signal-600"
                              title={`${site.activeDriftCount} active drift alerts`}
                            />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <span
                          className={`font-semibold ${
                            Math.abs(delta) < 0.005
                              ? 'text-graphite-500'
                              : isPulledDown
                              ? 'text-operational-700'
                              : 'text-signal-700'
                          }`}
                        >
                          {delta > 0 ? '+' : ''}
                          {(delta * 100).toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-graphite-400 block">
                          {Math.abs(delta) < 0.005 ? 'Stable' : isPulledDown ? 'Pulled to mean' : 'Adjusted up'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-graphite-600 text-[11px]">
                        [{(site.confidenceInterval[0] * 100).toFixed(0)}% —{' '}
                        {(site.confidenceInterval[1] * 100).toFixed(0)}%]
                      </td>
                      <td className="py-3 px-3 text-graphite-700 font-medium">
                        {site.dominantLsr}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            updateFilter('site', site.siteName);
                            navigate('/hidden-risk');
                          }}
                          className="px-2.5 py-1 rounded bg-surface-sunken hover:bg-surface-raised border border-surface-border text-petrol-700 font-semibold text-[11px] inline-flex items-center gap-1"
                        >
                          View Reports <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ACTIVITIES VIEW */}
      {activeTab === 'activities' && (
        <div className="bg-surface rounded-lg border border-surface-border overflow-hidden shadow-panel">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-sunken/60 text-graphite-500 uppercase tracking-wider text-[11px] border-b border-surface-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">Operational Task / Activity</th>
                  <th className="py-3 px-3 font-semibold">Reports Count</th>
                  <th className="py-3 px-3 font-semibold">SIF Precursor Count</th>
                  <th className="py-3 px-3 font-semibold">Precursor Rate</th>
                  <th className="py-3 px-3 font-semibold">Primary Life-Saving Rule</th>
                  <th className="py-3 px-3 font-semibold">Primary Energy Source</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border font-sans">
                {activityRankings.map((act) => (
                  <tr
                    key={act.activityName}
                    className="hover:bg-surface-sunken/40 transition-colors group"
                  >
                    <td className="py-3 px-4 font-bold text-graphite-900 group-hover:text-petrol-700">
                      {act.activityName}
                    </td>
                    <td className="py-3 px-3 font-mono font-medium">{act.totalReports}</td>
                    <td className="py-3 px-3 font-mono font-bold text-signal-700">
                      {act.sifReportsCount}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-graphite-900">
                      <div className="flex items-center gap-2">
                        <span>{(act.rawRate * 100).toFixed(1)}%</span>
                        <div className="w-16 bg-surface-sunken h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-signal-600 h-full rounded-full"
                            style={{ width: `${act.rawRate * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-graphite-700 font-medium">
                      {act.associatedLsrs?.join(', ') || 'General Safety'}
                    </td>
                    <td className="py-3 px-3 text-graphite-600">
                      {act.topEnergySource}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          updateFilter('activity', act.activityName);
                          navigate('/hidden-risk');
                        }}
                        className="px-2.5 py-1 rounded bg-surface-sunken hover:bg-surface-raised border border-surface-border text-petrol-700 font-semibold text-[11px] inline-flex items-center gap-1"
                      >
                        Inspect <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
