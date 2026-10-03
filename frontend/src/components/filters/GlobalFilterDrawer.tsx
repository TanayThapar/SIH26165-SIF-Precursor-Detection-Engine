import React from 'react';
import { useGlobalFilters } from '../../context/FilterContext';
import { X, Filter, RotateCcw, Check } from 'lucide-react';
import { LifeSavingRule } from '../../types/report';

interface GlobalFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_SITES = [
  'ALL',
  'Duliajan Drilling Rig 04',
  'Moran Gas Compressor Station',
  'Digboi Wellsite 12',
  'Naharkatiya Crude Pumping Station 2',
  'Kumchai Gas Processing Facility',
  'Jorhat Central Rig Yard',
  'Baghjan Well Cluster 05',
];

const AVAILABLE_ACTIVITIES = [
  'ALL',
  'Safe Mechanical Lifting',
  'Hot Work',
  'Energy Isolation',
  'Confined Space',
  'Working at Height',
  'Line of Fire',
  'Driving',
  'Work Authorization',
];

const AVAILABLE_LSRS: (LifeSavingRule | 'ALL')[] = [
  'ALL',
  'Bypassing Safety Controls',
  'Confined Space',
  'Driving',
  'Energy Isolation',
  'Hot Work',
  'Line of Fire',
  'Safe Mechanical Lifting',
  'Work Authorization',
  'Working at Height',
];

const AVAILABLE_BARRIERS = ['ALL', 'Bypassed', 'Failed', 'Missing', 'Held', 'Ineffective'];

const AVAILABLE_STATUSES = [
  'ALL',
  'review_required',
  'auto_escalated',
  'reviewed_correct',
  'reviewed_corrected',
  'dismissed',
];

export const GlobalFilterDrawer: React.FC<GlobalFilterDrawerProps> = ({ isOpen, onClose }) => {
  const { filters, updateFilter, resetFilters, activeFilterCount } = useGlobalFilters();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-graphite-950/40 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface border-l border-surface-border shadow-dropdown flex flex-col animate-slideInRight">
          {/* Header */}
          <div className="p-4 bg-surface-raised border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-petrol-700" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-graphite-900">
                Global Analytics Filters
              </h3>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-petrol-700 text-white text-[10px] font-bold">
                  {activeFilterCount} Active
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-graphite-400 hover:text-graphite-700 hover:bg-surface-sunken"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Controls Form */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Search Query */}
            <div>
              <label className="text-xs font-semibold text-graphite-700 block mb-1.5">
                Keyword / Report ID Search:
              </label>
              <input
                type="text"
                value={filters.searchQuery || ''}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                placeholder="Search incident descriptions, rigs, equipment..."
                className="w-full text-xs p-2.5 rounded border border-surface-border bg-surface focus:outline-none focus:ring-1 focus:ring-petrol-600"
              />
            </div>

            {/* SIF Potential Only Toggle */}
            <div className="p-3 bg-surface-sunken/60 rounded border border-surface-border flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-graphite-900 block">
                  SIF-Potential Precursors Only
                </span>
                <span className="text-[11px] text-graphite-500">
                  Filter out non-precursor baseline events
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.sifOnly}
                  onChange={(e) => updateFilter('sifOnly', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-signal-600"></div>
              </label>
            </div>

            {/* Site / Asset */}
            <div>
              <label className="text-xs font-semibold text-graphite-700 block mb-1.5">
                Operating Asset / Site:
              </label>
              <select
                value={filters.site || 'ALL'}
                onChange={(e) => updateFilter('site', e.target.value)}
                className="w-full text-xs p-2.5 rounded border border-surface-border bg-surface focus:outline-none focus:ring-1 focus:ring-petrol-600"
              >
                {AVAILABLE_SITES.map((site) => (
                  <option key={site} value={site}>
                    {site === 'ALL' ? 'All Oil India Sites & Assets' : site}
                  </option>
                ))}
              </select>
            </div>

            {/* Life-Saving Rule */}
            <div>
              <label className="text-xs font-semibold text-graphite-700 block mb-1.5">
                IOGP Life-Saving Rule:
              </label>
              <select
                value={filters.lifeSavingRule || 'ALL'}
                onChange={(e) => updateFilter('lifeSavingRule', e.target.value as any)}
                className="w-full text-xs p-2.5 rounded border border-surface-border bg-surface focus:outline-none focus:ring-1 focus:ring-petrol-600"
              >
                {AVAILABLE_LSRS.map((lsr) => (
                  <option key={lsr} value={lsr}>
                    {lsr === 'ALL' ? 'All Life-Saving Rules' : lsr}
                  </option>
                ))}
              </select>
            </div>

            {/* Barrier State */}
            <div>
              <label className="text-xs font-semibold text-graphite-700 block mb-1.5">
                Critical Barrier Condition:
              </label>
              <select
                value={filters.barrierState || 'ALL'}
                onChange={(e) => updateFilter('barrierState', e.target.value as any)}
                className="w-full text-xs p-2.5 rounded border border-surface-border bg-surface focus:outline-none focus:ring-1 focus:ring-petrol-600"
              >
                {AVAILABLE_BARRIERS.map((barrier) => (
                  <option key={barrier} value={barrier}>
                    {barrier === 'ALL' ? 'All Barrier States' : barrier}
                  </option>
                ))}
              </select>
            </div>

            {/* Operational Activity */}
            <div>
              <label className="text-xs font-semibold text-graphite-700 block mb-1.5">
                Operational Task / Activity:
              </label>
              <select
                value={filters.activity || 'ALL'}
                onChange={(e) => updateFilter('activity', e.target.value)}
                className="w-full text-xs p-2.5 rounded border border-surface-border bg-surface focus:outline-none focus:ring-1 focus:ring-petrol-600"
              >
                {AVAILABLE_ACTIVITIES.map((act) => (
                  <option key={act} value={act}>
                    {act === 'ALL' ? 'All Operational Activities' : act}
                  </option>
                ))}
              </select>
            </div>

            {/* Review Status */}
            <div>
              <label className="text-xs font-semibold text-graphite-700 block mb-1.5">
                HSE Review Queue Status:
              </label>
              <select
                value={filters.reviewStatus || 'ALL'}
                onChange={(e) => updateFilter('reviewStatus', e.target.value as any)}
                className="w-full text-xs p-2.5 rounded border border-surface-border bg-surface focus:outline-none focus:ring-1 focus:ring-petrol-600"
              >
                {AVAILABLE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status === 'ALL'
                      ? 'All Review Statuses'
                      : status.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-4 bg-surface-sunken border-t border-surface-border flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-2 rounded text-xs font-medium text-graphite-600 hover:text-graphite-900 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-petrol-700 hover:bg-petrol-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
