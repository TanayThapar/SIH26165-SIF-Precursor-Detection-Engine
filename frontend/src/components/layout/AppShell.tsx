import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  Crosshair,
  MapPin,
  Network,
  Activity,
  CheckSquare,
  Award,
  Filter,
  Search,
  Server,
  ShieldAlert,
  Menu,
  X,
  Droplet,
  ExternalLink,
} from 'lucide-react';
import { useGlobalFilters } from '../../context/FilterContext';
import { useReportDrawer } from '../../context/DrawerContext';
import { ReportDrawer } from '../reports/ReportDrawer';
import { GlobalFilterDrawer } from '../filters/GlobalFilterDrawer';
import { BackendSwitcherModal } from '../modals/BackendSwitcherModal';
import { ThemeToggle } from '../ui/ThemeToggle';
import { getDataMode } from '../../api/client';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const { filters, updateFilter, activeFilterCount } = useGlobalFilters();
  const { isDrawerOpen, activeReport, closeReport, onReportUpdated } = useReportDrawer();

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dataMode = getDataMode();

  // Navigation Items
  const navItems = [
    {
      to: '/overview',
      label: 'Executive Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      to: '/analyze',
      label: 'Report Analyzer',
      icon: <FileSearch className="w-4 h-4" />,
    },
    {
      to: '/hidden-risk',
      label: 'Hidden Risk',
      icon: <Crosshair className="w-4 h-4" />,
    },
    {
      to: '/risk-ranking',
      label: 'Site & Activity Risk',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      to: '/precursor-graph',
      label: 'Precursor Graph',
      icon: <Network className="w-4 h-4" />,
    },
    {
      to: '/drift',
      label: 'Drift Alerts',
      icon: <Activity className="w-4 h-4" />,
      badge: '4 Active',
      badgeColor: 'bg-signal-500/20 text-signal-300 border border-signal-500/40',
    },
    {
      to: '/triage',
      label: 'Triage & Review',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: '18 Queue',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    },
    {
      to: '/evaluation',
      label: 'Model Evaluation',
      icon: <Award className="w-4 h-4" />,
    },
  ];

  // Helper to determine page title
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/overview':
        return {
          title: 'FaultLine Executive Overview',
          subtitle: 'Outcome-blind safety risk intelligence across all Oil India operational assets',
        };
      case '/analyze':
        return {
          title: 'Precursor Report Analyzer',
          subtitle: 'Dual-lens inspection: Original logged report vs. Outcome-blind representation',
        };
      case '/hidden-risk':
        return {
          title: 'Hidden Risk Distribution',
          subtitle: 'Identifying high fatal-potential events masked by harmless actual outcomes',
        };
      case '/risk-ranking':
        return {
          title: 'Site & Activity Risk Ranking',
          subtitle: 'Empirical Bayes shrinkage-adjusted precursor rates across rigs, plants & fields',
        };
      case '/precursor-graph':
        return {
          title: 'Precursor Co-Occurrence Network',
          subtitle: 'Multi-entity hazard graph mapping high-lift combinations of energy, barriers & rules',
        };
      case '/drift':
        return {
          title: 'Statistical Drift & Change Points',
          subtitle: 'Early warning signals detecting precursor frequency shifts before fatal incidents occur',
        };
      case '/triage':
        return {
          title: 'HSE Triage & Expert Review Queue',
          subtitle: 'Human-in-the-loop audit workspace for model predictions and safety rule overrides',
        };
      case '/evaluation':
        return {
          title: 'Model Evaluation & Benchmark Honesty',
          subtitle: 'Rigorous comparative metrics: TF-IDF vs. Outcome-Aware vs. Neuro-Symbolic Engine',
        };
      default:
        return {
          title: 'FaultLine Engine',
          subtitle: 'SIF Precursor Detection Engine • Oil India Limited (SIH26165)',
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen flex bg-canvas dark:bg-black text-graphite-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-graphite-950/60 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* LEFT NAVIGATION RAIL */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-graphite-950 dark:bg-black text-slate-300 border-r border-graphite-800 dark:border-[#1E2736] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-graphite-850 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-petrol-600 flex items-center justify-center text-white shadow-sm ring-1 ring-white/10">
              <Droplet className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-widest text-white uppercase">
                  FAULTLINE
                </span>
                <span className="text-[9px] font-bold px-1 rounded bg-petrol-900 text-petrol-300 border border-petrol-700">
                  OIL INDIA
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] text-petrol-400 font-medium tracking-tight">
                  SIF Precursor Detection Engine
                </p>
                <span className="w-1.5 h-1.5 rounded-full bg-petrol-400 animate-pulse" title="System operational" />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded text-graphite-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-xs">
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-graphite-500">
            Analytics & Operations
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded font-medium transition-all ${
                  isActive
                    ? 'bg-petrol-700 text-white shadow-sm'
                    : 'text-graphite-300 hover:bg-graphite-900 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Rail Status Widget */}
        <div className="p-3 border-t border-graphite-850 bg-graphite-900/60 space-y-2 text-[11px]">
          {/* Data Mode */}
          <div className="p-2 rounded bg-graphite-850/80 border border-graphite-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider font-semibold text-graphite-400 block">
                DATA MODE
              </span>
              <span className="font-medium text-amber-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Synthetic Demo
              </span>
            </div>
            <span className="text-[9px] text-graphite-400 bg-graphite-800 px-1 py-0.5 rounded">
              Non-Prod
            </span>
          </div>

          {/* Backend Connection */}
          <button
            type="button"
            onClick={() => setIsBackendModalOpen(true)}
            className="w-full p-2 rounded bg-graphite-850/80 border border-graphite-800 hover:border-petrol-600 transition-colors flex items-center justify-between text-left group"
          >
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider font-semibold text-graphite-400 block">
                BACKEND ADAPTER
              </span>
              <span className="font-medium text-slate-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-operational-500 animate-pulse" />
                {dataMode === 'api' ? 'Live REST API' : 'Mock Adapter'}
              </span>
            </div>
            <Server className="w-3.5 h-3.5 text-graphite-400 group-hover:text-petrol-400 transition-colors" />
          </button>

          {/* Theme Mode Toggle (Night / Day) */}
          <div className="pt-1">
            <ThemeToggle compact={false} />
          </div>

          {/* App Version */}
          <div className="pt-1 flex items-center justify-between text-[10px] text-graphite-500 font-mono">
            <span>FaultLine v1.0.0</span>
            <span>OIL-SIH26165</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* GLOBAL PERSISTENT PROVENANCE BANNER */}
        <div className="bg-amber-500/10 dark:bg-amber-950/20 border-b border-amber-500/30 dark:border-amber-500/20 px-4 py-1.5 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
            <span className="font-semibold text-[11px] uppercase tracking-wide text-amber-800 dark:text-amber-300">
              Demo Environment:
            </span>
            <span className="text-[11px] text-amber-950 dark:text-amber-200">
              Operating on realistic synthetic safety reports — not Oil India operational live data.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsBackendModalOpen(true)}
            className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 underline underline-offset-2 shrink-0 flex items-center gap-0.5"
          >
            Adapter Settings <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* TOP CONTEXTUAL BAR */}
        <header className="bg-surface dark:bg-black border-b border-surface-border dark:border-[#1E2736] sticky top-0 z-30 px-4 py-3 shadow-panel">
          <div className="flex items-center justify-between gap-4">
            {/* Title & Hamburger */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 rounded text-graphite-600 hover:bg-surface-sunken lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-graphite-950 truncate tracking-tight">
                    {pageInfo.title}
                  </h1>
                  <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>ACTIVE MON</span>
                  </div>
                </div>
                <p className="text-xs text-graphite-500 truncate">{pageInfo.subtitle}</p>
              </div>
            </div>

            {/* Quick Actions, Theme Toggle & Search */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Quick Search */}
              <div className="relative hidden md:block w-52">
                <Search className="w-3.5 h-3.5 text-graphite-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filters.searchQuery || ''}
                  onChange={(e) => updateFilter('searchQuery', e.target.value)}
                  placeholder="Quick search reports..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded border border-surface-border bg-surface-sunken/40 focus:bg-surface focus:outline-none focus:ring-1 focus:ring-petrol-600 transition-colors"
                />
              </div>

              {/* Filter Button */}
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(true)}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  activeFilterCount > 0
                    ? 'bg-petrol-50 text-petrol-800 border-petrol-400 shadow-xs'
                    : 'bg-surface border-surface-border text-graphite-700 hover:bg-surface-sunken'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-petrol-700" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-petrol-700 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Backend Indicator Button */}
              <button
                type="button"
                onClick={() => setIsBackendModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-surface-border bg-surface text-xs font-medium text-graphite-700 hover:bg-surface-sunken transition-colors"
                title="Configure Backend Adapter"
              >
                <span className="w-2 h-2 rounded-full bg-operational-500 animate-pulse" />
                <span>{dataMode === 'api' ? 'Live API' : 'Mock'}</span>
              </button>

              {/* Theme Mode Toggle (Compact) */}
              <ThemeToggle compact={true} />
            </div>
          </div>

          {/* Active Filter Pills Bar (if filters are active) */}
          {activeFilterCount > 0 && (
            <div className="mt-2 pt-2 border-t border-surface-border flex items-center gap-1.5 overflow-x-auto text-[11px] text-graphite-600">
              <span className="font-semibold text-graphite-500 uppercase tracking-wider text-[10px] shrink-0">
                Active Filters:
              </span>
              {filters.searchQuery && (
                <span className="px-2 py-0.5 rounded bg-surface-sunken border border-surface-border text-graphite-800 font-mono">
                  q: "{filters.searchQuery}"
                </span>
              )}
              {filters.site && filters.site !== 'ALL' && (
                <span className="px-2 py-0.5 rounded bg-petrol-50 border border-petrol-200 text-petrol-800">
                  Site: {filters.site}
                </span>
              )}
              {filters.lifeSavingRule && filters.lifeSavingRule !== 'ALL' && (
                <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800">
                  LSR: {filters.lifeSavingRule}
                </span>
              )}
              {filters.barrierState && filters.barrierState !== 'ALL' && (
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800">
                  Barrier: {filters.barrierState}
                </span>
              )}
              {filters.sifOnly && (
                <span className="px-2 py-0.5 rounded bg-signal-50 border border-signal-200 text-signal-800 font-semibold">
                  SIF Precursors Only
                </span>
              )}
            </div>
          )}
        </header>

        {/* WORKSPACE OUTLET */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-canvas dark:bg-black transition-colors duration-200">
          <Outlet />
        </main>
      </div>

      {/* GLOBAL DRAWERS & MODALS */}
      <ReportDrawer
        report={activeReport}
        isOpen={isDrawerOpen}
        onClose={closeReport}
        onReportUpdated={onReportUpdated}
      />

      <GlobalFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
      />

      <BackendSwitcherModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
      />
    </div>
  );
};
