import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle,
  MapPin,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  fetchDriftAlerts,
  fetchDriftTimeSeries,
  updateDriftAlertStatus,
} from '../services';
import { DriftAlert, DriftWeeklyTimeSeries, DriftAlertStatus } from '../types/drift';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useGlobalFilters } from '../context/FilterContext';

export const DriftAlertsPage: React.FC = () => {
  const { filters } = useGlobalFilters();

  const [alerts, setAlerts] = useState<DriftAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<DriftAlert | null>(null);
  const [timeSeries, setTimeSeries] = useState<DriftWeeklyTimeSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadAlerts() {
      setLoading(true);
      try {
        const [alertList, ts] = await Promise.all([
          fetchDriftAlerts(filters),
          fetchDriftTimeSeries(),
        ]);
        if (isMounted) {
          setAlerts(alertList);
          setTimeSeries(ts);
          if (alertList.length > 0) {
            setSelectedAlert(alertList[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load drift alerts', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadAlerts();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  const handleStatusUpdate = async (status: DriftAlertStatus) => {
    if (!selectedAlert) return;
    setUpdating(true);
    try {
      const updated = await updateDriftAlertStatus(
        selectedAlert.id,
        status,
        'OIL Field Safety Superintendent'
      );
      setSelectedAlert(updated);
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setActionSuccess(`Alert ${updated.id} status changed to ${status}`);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-2 border-petrol-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-graphite-500 font-medium">
          Running CUSUM change-point statistical monitors...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* HEADER EXPLANATION BANNER */}
      <div className="bg-surface rounded-lg border border-surface-border p-4 shadow-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-signal-500/10 text-signal-700 shrink-0 mt-0.5">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-graphite-900">
                Statistical Drift & Precursor Change-Points
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-signal-50 text-signal-700 border border-signal-200 font-semibold">
                CUSUM + Page-Hinkley
              </span>
            </div>
            <p className="text-xs text-graphite-600 mt-1 max-w-4xl leading-relaxed">
              Detecting subtle shifts in barrier failure frequencies, bypass rates, and line-of-fire near misses before they materialize into severe loss-of-containment or fatal events.
            </p>
          </div>
        </div>

        <div className="text-xs text-graphite-500 shrink-0">
          Active Drift Alerts: <strong className="text-signal-700 text-sm font-mono">{alerts.length}</strong>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-operational-50 border border-operational-300 rounded text-xs text-operational-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-operational-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* TWO COLUMN WORKSPACE: ALERT LIST & DRIFT DETAIL/CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ACTIVE ALERTS LIST */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-graphite-700 block">
            Triggered Change-Point Signals
          </span>

          <div className="space-y-3">
            {alerts.map((alert) => {
              const isSelected = selectedAlert?.id === alert.id;
              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-surface border-petrol-600 ring-2 ring-petrol-600/20 shadow-elevated'
                      : 'bg-surface border-surface-border hover:border-surface-border-strong hover:shadow-panel'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-graphite-900">
                      {alert.id}
                    </span>
                    <StatusBadge status={alert.status} type="drift" />
                  </div>

                  <h4 className="text-xs font-bold text-graphite-900 leading-snug">
                    {alert.signalName}
                  </h4>

                  <div className="mt-2 flex items-center gap-3 text-[11px] text-graphite-500">
                    <span className="flex items-center gap-1 font-medium text-graphite-700 truncate">
                      <MapPin className="w-3 h-3 text-petrol-700 shrink-0" />
                      {alert.site}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-graphite-400" />
                      {alert.detectedDate}
                    </span>
                  </div>

                  {/* Drift percentage metric pill */}
                  <div className="mt-3 pt-2.5 border-t border-surface-border/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-[11px] text-graphite-500 font-sans">
                      Baseline: {(alert.baselineRate * 100).toFixed(1)}% → Current: {(alert.currentRate * 100).toFixed(1)}%
                    </span>
                    <span className="font-bold text-signal-700 bg-signal-50 px-2 py-0.5 rounded border border-signal-200">
                      +{alert.driftPercentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: DRIFT INSPECTOR & TIME-SERIES VISUAL */}
        <div className="lg:col-span-7 space-y-5">
          {selectedAlert ? (
            <div className="bg-surface rounded-lg border border-surface-border p-5 shadow-panel space-y-5">
              {/* Alert Header */}
              <div className="pb-4 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-graphite-950">
                      {selectedAlert.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-signal-100 text-signal-800 text-[10px] font-bold border border-signal-300 uppercase">
                      {selectedAlert.severity}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-graphite-900 mt-1">
                    {selectedAlert.signalName}
                  </h3>
                  <p className="text-xs text-graphite-500 mt-0.5">
                    Location: <strong>{selectedAlert.site}</strong> • Unit: {selectedAlert.unitOrPlant}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={selectedAlert.status} type="drift" />
                </div>
              </div>

              {/* Statistical Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded bg-surface-sunken/50 border border-surface-border">
                  <span className="text-[10px] font-semibold text-graphite-500 uppercase block mb-1">
                    Historical Baseline
                  </span>
                  <span className="text-sm font-bold text-graphite-800 font-mono">
                    {(selectedAlert.baselineRate * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-graphite-400 block mt-0.5 truncate">
                    {selectedAlert.baselinePeriod}
                  </span>
                </div>

                <div className="p-3 rounded bg-signal-50/50 border border-signal-200">
                  <span className="text-[10px] font-semibold text-signal-800 uppercase block mb-1">
                    Current Rate
                  </span>
                  <span className="text-sm font-bold text-signal-900 font-mono">
                    {(selectedAlert.currentRate * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-signal-700 block mt-0.5">
                    +{selectedAlert.driftPercentage.toFixed(0)}% relative shift
                  </span>
                </div>

                <div className="p-3 rounded bg-surface-sunken/50 border border-surface-border">
                  <span className="text-[10px] font-semibold text-graphite-500 uppercase block mb-1">
                    CUSUM Statistic
                  </span>
                  <span className="text-sm font-bold text-graphite-900 font-mono">
                    {selectedAlert.cusumStatistic.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-graphite-400 block mt-0.5">
                    Threshold: {selectedAlert.thresholdValue.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded bg-surface-sunken/50 border border-surface-border">
                  <span className="text-[10px] font-semibold text-graphite-500 uppercase block mb-1">
                    Affected Barrier
                  </span>
                  <span className="text-xs font-bold text-graphite-900 block truncate">
                    {selectedAlert.affectedBarrier}
                  </span>
                  <span className="text-[10px] text-graphite-500 block mt-0.5 truncate">
                    {selectedAlert.relevantLsr}
                  </span>
                </div>
              </div>

              {/* Time Series Chart */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-graphite-800 block mb-2">
                  12-Week Weekly Moving Window Signal Rate
                </span>
                <div className="h-56 bg-surface-sunken/30 rounded border border-surface-border p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E6EB" />
                      <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} />
                      <YAxis
                        tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                        domain={[0, 0.45]}
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        axisLine={false}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          const p = payload[0].payload;
                          return (
                            <div className="bg-graphite-950 text-white p-2.5 rounded text-xs font-mono space-y-1">
                              <div>Week: {label}</div>
                              <div>Rate: {(p.rate * 100).toFixed(1)}%</div>
                              <div>CUSUM Score: {p.cusumValue}</div>
                            </div>
                          );
                        }}
                      />
                      <ReferenceLine
                        y={selectedAlert.baselineRate}
                        stroke="#64748B"
                        strokeDasharray="3 3"
                        label={{ value: 'Baseline', fill: '#64748B', fontSize: 10 }}
                      />
                      <ReferenceLine
                        y={0.25}
                        stroke="#DC2626"
                        strokeDasharray="4 4"
                        label={{ value: 'Alarm Limit', fill: '#DC2626', fontSize: 10 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="rate"
                        stroke="#DC2626"
                        strokeWidth={2}
                        fill="#FEE2E2"
                        fillOpacity={0.6}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Context Summary & Recommended Prevention Actions */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-surface-sunken/60 rounded border border-surface-border">
                  <span className="font-semibold text-graphite-900 uppercase tracking-wide text-[11px] block mb-1">
                    Statistical Change-Point Context:
                  </span>
                  <p className="text-graphite-700 leading-relaxed">
                    {selectedAlert.contextSummary}
                  </p>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded">
                  <span className="font-semibold text-amber-900 uppercase tracking-wide text-[11px] block mb-1">
                    Recommended HSE Preventative Action:
                  </span>
                  <p className="text-amber-950 leading-relaxed font-medium">
                    {selectedAlert.recommendedAction}
                  </p>
                </div>

                {selectedAlert.acknowledgedBy && (
                  <div className="text-[11px] text-graphite-500 font-mono">
                    Acknowledged by: <strong>{selectedAlert.acknowledgedBy}</strong>
                  </div>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-surface-border flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-graphite-500">
                  Update HSE Operational Status:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={updating || selectedAlert.status === 'Acknowledged'}
                    onClick={() => handleStatusUpdate('Acknowledged')}
                    className="px-3 py-1.5 rounded bg-surface-sunken hover:bg-surface-raised border border-surface-border text-xs font-semibold text-graphite-800 disabled:opacity-40"
                  >
                    Acknowledge
                  </button>
                  <button
                    type="button"
                    disabled={updating || selectedAlert.status === 'Under Review'}
                    onClick={() => handleStatusUpdate('Under Review')}
                    className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold disabled:opacity-40"
                  >
                    Investigating
                  </button>
                  <button
                    type="button"
                    disabled={updating || selectedAlert.status === 'Resolved'}
                    onClick={() => handleStatusUpdate('Resolved')}
                    className="px-3 py-1.5 rounded bg-operational-600 hover:bg-operational-700 text-white text-xs font-semibold disabled:opacity-40"
                  >
                    Resolve & Close
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-graphite-400">
              Select an alert from the queue to view CUSUM time-series and preventative action steps.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
