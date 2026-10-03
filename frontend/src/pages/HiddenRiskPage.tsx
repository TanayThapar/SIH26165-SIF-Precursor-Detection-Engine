import React, { useState, useEffect, useMemo } from 'react';
import {
  Crosshair,
  ArrowUpDown,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { fetchReports } from '../services';
import { SafetyReport } from '../types/report';
import { SeverityIndicator } from '../components/ui/SeverityIndicator';
import { HiddenRiskIndicator } from '../components/ui/HiddenRiskIndicator';
import { RiskBadge } from '../components/ui/RiskBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LifeSavingRuleTags } from '../components/ui/LifeSavingRuleTags';
import { useReportDrawer } from '../context/DrawerContext';
import { useGlobalFilters } from '../context/FilterContext';

export const HiddenRiskPage: React.FC = () => {
  const { filters } = useGlobalFilters();
  const { openReport } = useReportDrawer();

  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'ALL' | 'HIGH' | 'MODERATE' | 'ZERO'>('ALL');
  const [sortField, setSortField] = useState<'hiddenRisk' | 'sifProbability' | 'id'>('hiddenRisk');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let isMounted = true;
    async function loadReports() {
      setLoading(true);
      try {
        const reps = await fetchReports(filters);
        if (isMounted) setReports(reps);
      } catch (err) {
        console.error('Failed to load reports for hidden risk page', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadReports();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  // Scatter plot data mapping
  // Add subtle jitter (±0.15) so identical coordinates (e.g. actual=1, potential=6) don't completely overlap
  const scatterData = useMemo(() => {
    return reports.map((r) => {
      // Deterministic pseudo-jitter based on report id char code
      const hash = r.id.charCodeAt(r.id.length - 1) % 10;
      const jitterX = (hash - 5) * 0.035;
      const jitterY = ((r.id.charCodeAt(0) % 10) - 5) * 0.035;

      return {
        ...r,
        x: r.actualSeverity + jitterX,
        y: r.potentialSeverity + jitterY,
        z: r.hiddenRisk >= 4 ? 120 : r.hiddenRisk >= 2 ? 80 : 40,
        fillColor:
          r.hiddenRisk >= 4
            ? '#DC2626'
            : r.hiddenRisk >= 2
            ? '#D97706'
            : r.hiddenRisk === 1
            ? '#3CA0A2'
            : '#64748B',
      };
    });
  }, [reports]);

  // Table filtering and sorting
  const filteredReports = useMemo(() => {
    let list = [...reports];

    if (selectedRiskFilter === 'HIGH') {
      list = list.filter((r) => r.hiddenRisk >= 3);
    } else if (selectedRiskFilter === 'MODERATE') {
      list = list.filter((r) => r.hiddenRisk === 1 || r.hiddenRisk === 2);
    } else if (selectedRiskFilter === 'ZERO') {
      list = list.filter((r) => r.hiddenRisk <= 0);
    }

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [reports, selectedRiskFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredReports.length / pageSize) || 1;
  const paginatedReports = filteredReports.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: 'hiddenRisk' | 'sifProbability' | 'id') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-2 border-petrol-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-graphite-500 font-medium">
          Mapping precursor severity vectors...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* CONCEPT BANNER */}
      <div className="bg-surface rounded-lg border border-surface-border p-4 shadow-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-amber-500/10 text-amber-700 shrink-0 mt-0.5">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-graphite-900">
                Hidden Risk Concept: Potential Severity vs. Observed Outcome
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-sunken border text-graphite-600 font-semibold">
                Δ = Potential − Actual
              </span>
            </div>
            <p className="text-xs text-graphite-600 mt-1 max-w-4xl leading-relaxed">
              In safety analytics, benign outcomes frequently blind investigators to catastrophic hazard geometry. Points located furthest above the diagonal (y = x) represent maximum Hidden Risk — where luck intervened to prevent a serious injury or fatality.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs shrink-0 font-medium">
          <span className="text-graphite-500">Filter By Magnitude:</span>
          <div className="inline-flex rounded border border-surface-border bg-surface-sunken p-0.5 text-xs">
            <button
              type="button"
              onClick={() => { setSelectedRiskFilter('ALL'); setPage(1); }}
              className={`px-2.5 py-1 rounded transition-colors ${
                selectedRiskFilter === 'ALL'
                  ? 'bg-petrol-700 text-white font-semibold'
                  : 'text-graphite-600 hover:text-graphite-900'
              }`}
            >
              All ({reports.length})
            </button>
            <button
              type="button"
              onClick={() => { setSelectedRiskFilter('HIGH'); setPage(1); }}
              className={`px-2.5 py-1 rounded transition-colors ${
                selectedRiskFilter === 'HIGH'
                  ? 'bg-signal-700 text-white font-semibold'
                  : 'text-graphite-600 hover:text-graphite-900'
              }`}
            >
              High Δ ≥ +3 ({reports.filter((r) => r.hiddenRisk >= 3).length})
            </button>
            <button
              type="button"
              onClick={() => { setSelectedRiskFilter('MODERATE'); setPage(1); }}
              className={`px-2.5 py-1 rounded transition-colors ${
                selectedRiskFilter === 'MODERATE'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-graphite-600 hover:text-graphite-900'
              }`}
            >
              Moderate Δ (+1..+2)
            </button>
          </div>
        </div>
      </div>

      {/* SIGNATURE INTERACTIVE SCATTER PLOT */}
      <div className="bg-surface rounded-lg border border-surface-border p-5 shadow-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-border gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-graphite-800">
              Severity Matrix Scatter Plot
            </span>
            <p className="text-xs text-graphite-500 mt-0.5">
              Click any point to open the full outcome-blind inspection drawer
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-signal-600 inline-block" />
              <span className="text-graphite-600">High Hidden Risk (Δ ≥ +4)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-graphite-600">Moderate Hidden Risk (Δ +2..+3)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-slate-400 inline-block" />
              <span className="text-graphite-600">y = x Baseline</span>
            </div>
          </div>
        </div>

        <div className="h-80 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.12} />
              <XAxis
                type="number"
                dataKey="x"
                name="Actual Outcome Severity"
                domain={[0.5, 6.5]}
                ticks={[1, 2, 3, 4, 5, 6]}
                tickFormatter={(val) => `L${Math.round(val)}`}
                label={{
                  value: 'Observed Actual Outcome Severity (Level I: Near-Miss → Level VI: Fatal)',
                  position: 'bottom',
                  offset: 5,
                  fontSize: 11,
                  fill: '#64748B',
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Potential Precursor Severity"
                domain={[0.5, 6.5]}
                ticks={[1, 2, 3, 4, 5, 6]}
                tickFormatter={(val) => `L${Math.round(val)}`}
                label={{
                  value: 'Predicted Potential Severity (Level I → Level VI: Fatal Potential)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  fontSize: 11,
                  fill: '#64748B',
                }}
              />
              <ZAxis type="number" dataKey="z" range={[50, 180]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="bg-graphite-950 text-white p-3 rounded shadow-dropdown border border-graphite-800 text-xs space-y-1.5 max-w-xs">
                      <div className="flex items-center justify-between border-b border-graphite-800 pb-1">
                        <span className="font-mono font-bold text-petrol-300">{item.id}</span>
                        <span className="font-bold text-amber-400">Δ +{item.hiddenRisk}</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        <strong>Site:</strong> {item.site}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        <strong>Observed:</strong> {item.actualSeverityLabel.split('—')[1]}
                      </div>
                      <div className="text-[11px] text-signal-300">
                        <strong>Potential:</strong> {item.potentialSeverityLabel.split('—')[1]}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 pt-1 border-t border-graphite-800">
                        {item.originalText}
                      </p>
                      <span className="text-[10px] text-petrol-300 font-semibold block pt-0.5">
                        Click to inspect full report →
                      </span>
                    </div>
                  );
                }}
              />
              {/* y = x diagonal line */}
              <ReferenceLine
                segment={[
                  { x: 0.5, y: 0.5 },
                  { x: 6.5, y: 6.5 },
                ]}
                stroke="#94A3B8"
                strokeDasharray="4 4"
                label={{
                  value: 'y = x (Concordant Risk)',
                  fill: '#94A3B8',
                  fontSize: 10,
                  position: 'insideBottomRight',
                }}
              />
              <Scatter
                name="Incidents"
                data={scatterData}
                onClick={(node: any) => {
                  if (node && node.id) openReport(node);
                }}
                className="cursor-pointer"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DENSE SORTABLE DATA TABLE */}
      <div className="bg-surface rounded-lg border border-surface-border overflow-hidden shadow-panel">
        <div className="p-4 bg-surface-raised border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-graphite-800">
              Hidden Risk Priority Incident Ledger
            </h3>
            <p className="text-xs text-graphite-500 mt-0.5">
              Showing {filteredReports.length} reports filtered by precursor severity discrepancy
            </p>
          </div>

          <div className="text-xs text-graphite-500">
            Page <strong className="text-graphite-900">{page}</strong> of{' '}
            <strong className="text-graphite-900">{totalPages}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-sunken/60 text-graphite-500 uppercase tracking-wider text-[11px] border-b border-surface-border">
              <tr>
                <th
                  onClick={() => toggleSort('id')}
                  className="py-2.5 px-4 font-semibold cursor-pointer hover:text-graphite-900"
                >
                  <div className="flex items-center gap-1">
                    Report ID <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold">Site / Facility</th>
                <th className="py-2.5 px-3 font-semibold">Activity</th>
                <th className="py-2.5 px-3 font-semibold">Observed</th>
                <th className="py-2.5 px-3 font-semibold">Potential</th>
                <th
                  onClick={() => toggleSort('hiddenRisk')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-graphite-900"
                >
                  <div className="flex items-center gap-1">
                    Hidden Risk (Δ) <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('sifProbability')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-graphite-900"
                >
                  <div className="flex items-center gap-1">
                    SIF Prob <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold">Life-Saving Rule</th>
                <th className="py-2.5 px-3 font-semibold">Review Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border font-sans">
              {paginatedReports.map((report) => (
                <tr
                  key={report.id}
                  onClick={() => openReport(report)}
                  className="hover:bg-surface-sunken/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-graphite-900 group-hover:text-petrol-700">
                    {report.id}
                  </td>
                  <td className="py-3 px-3 text-graphite-700 font-medium truncate max-w-[160px]">
                    {report.site}
                  </td>
                  <td className="py-3 px-3 text-graphite-600 truncate max-w-[140px]">
                    {report.activity}
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
                    <LifeSavingRuleTags rules={report.lifeSavingRules} maxVisible={1} />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={report.reviewStatus} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-[11px] font-semibold text-petrol-700 group-hover:underline flex items-center justify-end gap-1">
                      Inspect <Eye className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-surface-sunken/40 border-t border-surface-border flex items-center justify-between text-xs text-graphite-600">
          <span>
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, filteredReports.length)} of {filteredReports.length} records
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="p-1 rounded border border-surface-border bg-surface hover:bg-surface-raised disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono font-medium">{page} / {totalPages}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="p-1 rounded border border-surface-border bg-surface hover:bg-surface-raised disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
