import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  AlertTriangle,
  Eye,
  Search,
} from 'lucide-react';
import { fetchReports } from '../services';
import { SafetyReport, ReviewStatus } from '../types/report';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SeverityIndicator } from '../components/ui/SeverityIndicator';
import { HiddenRiskIndicator } from '../components/ui/HiddenRiskIndicator';
import { RiskBadge } from '../components/ui/RiskBadge';
import { LifeSavingRuleTags } from '../components/ui/LifeSavingRuleTags';
import { useReportDrawer } from '../context/DrawerContext';
import { useGlobalFilters } from '../context/FilterContext';

export const TriagePage: React.FC = () => {
  const { filters } = useGlobalFilters();
  const { openReport } = useReportDrawer();

  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatusTab, setSelectedStatusTab] = useState<ReviewStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadReports() {
      setLoading(true);
      try {
        const reps = await fetchReports(filters);
        if (isMounted) setReports(reps);
      } catch (err) {
        console.error('Failed to load reports for triage', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadReports();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  const statusCounts = useMemo(() => {
    return {
      ALL: reports.length,
      auto_escalated: reports.filter((r) => r.reviewStatus === 'auto_escalated').length,
      review_required: reports.filter((r) => r.reviewStatus === 'review_required').length,
      reviewed_correct: reports.filter((r) => r.reviewStatus === 'reviewed_correct').length,
      reviewed_corrected: reports.filter((r) => r.reviewStatus === 'reviewed_corrected').length,
      dismissed: reports.filter((r) => r.reviewStatus === 'dismissed').length,
    };
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (selectedStatusTab !== 'ALL' && r.reviewStatus !== selectedStatusTab) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.id.toLowerCase().includes(q) ||
          r.site.toLowerCase().includes(q) ||
          r.originalText.toLowerCase().includes(q) ||
          r.activity.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reports, selectedStatusTab, search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-2 border-petrol-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-graphite-500 font-medium">
          Loading HSE human-in-the-loop review queue...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* HEADER BANNER */}
      <div className="bg-surface rounded-lg border border-surface-border p-4 shadow-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-petrol-500/10 text-petrol-700 shrink-0 mt-0.5">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-graphite-900">
                HSE Triage & Model Review Workspace
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-sunken border text-graphite-600 font-semibold">
                Active Queue: {statusCounts.review_required + statusCounts.auto_escalated} Pending
              </span>
            </div>
            <p className="text-xs text-graphite-600 mt-1 max-w-4xl leading-relaxed">
              Domain HSE officers review high-discrepancy precursor predictions, resolve neuro-symbolic rule divergence, and log corrections to continuously calibrate detection sensitivity.
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-graphite-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search review queue..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded border border-surface-border bg-surface focus:outline-none focus:ring-1 focus:ring-petrol-600"
          />
        </div>
      </div>

      {/* STATUS FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-surface-border pb-1 text-xs">
        {[
          { key: 'ALL', label: 'All Reports', count: statusCounts.ALL },
          { key: 'auto_escalated', label: 'Auto-Escalated', count: statusCounts.auto_escalated },
          { key: 'review_required', label: 'Review Required', count: statusCounts.review_required },
          { key: 'reviewed_correct', label: 'Confirmed SIF', count: statusCounts.reviewed_correct },
          { key: 'reviewed_corrected', label: 'HSE Corrected', count: statusCounts.reviewed_corrected },
          { key: 'dismissed', label: 'Dismissed Non-SIF', count: statusCounts.dismissed },
        ].map((tab) => {
          const isActive = selectedStatusTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedStatusTab(tab.key as any)}
              className={`px-3 py-1.5 rounded font-semibold text-xs flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-petrol-700 text-white shadow-xs'
                  : 'bg-surface text-graphite-600 hover:text-graphite-900 border border-surface-border'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-surface-sunken text-graphite-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* DENSE TRIAGE TABLE */}
      <div className="bg-surface rounded-lg border border-surface-border overflow-hidden shadow-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-sunken/60 text-graphite-500 uppercase tracking-wider text-[11px] border-b border-surface-border">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Incident ID</th>
                <th className="py-2.5 px-3 font-semibold">Site / Rig</th>
                <th className="py-2.5 px-3 font-semibold">Observed</th>
                <th className="py-2.5 px-3 font-semibold">Potential</th>
                <th className="py-2.5 px-3 font-semibold">Hidden Risk</th>
                <th className="py-2.5 px-3 font-semibold">SIF Score</th>
                <th className="py-2.5 px-3 font-semibold">Rule Divergence</th>
                <th className="py-2.5 px-3 font-semibold">Life-Saving Rule</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border font-sans">
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  onClick={() => openReport(report)}
                  className="hover:bg-surface-sunken/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-graphite-900 group-hover:text-petrol-700">
                    {report.id}
                  </td>
                  <td className="py-3 px-3 text-graphite-700 font-medium truncate max-w-[150px]">
                    {report.site}
                  </td>
                  <td className="py-3 px-3">
                    <SeverityIndicator level={report.actualSeverity} size="sm" showLabel={false} />
                  </td>
                  <td className="py-3 px-3">
                    <SeverityIndicator level={report.potentialSeverity} size="sm" showLabel={false} />
                  </td>
                  <td className="py-3 px-3">
                    <HiddenRiskIndicator hiddenRisk={report.hiddenRisk} />
                  </td>
                  <td className="py-3 px-3">
                    <RiskBadge
                      probability={report.sifProbability}
                      riskBand={report.riskBand}
                      size="sm"
                    />
                  </td>
                  <td className="py-3 px-3">
                    {report.reasoning.modelRuleDisagreement ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Disagreement
                      </span>
                    ) : (
                      <span className="text-[11px] text-graphite-400 font-medium">Concordant</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <LifeSavingRuleTags rules={report.lifeSavingRules} maxVisible={1} />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={report.reviewStatus} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-[11px] font-semibold text-petrol-700 group-hover:underline flex items-center justify-end gap-1">
                      Review <Eye className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="p-8 text-center text-graphite-400 text-xs">
            No safety reports match the selected queue filter or search query.
          </div>
        )}
      </div>
    </div>
  );
};
