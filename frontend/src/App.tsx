import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FilterProvider } from './context/FilterContext';
import { DrawerProvider } from './context/DrawerContext';
import { AppShell } from './components/layout/AppShell';

// Route-level code splitting for performance and fast initial load
const OverviewPage = React.lazy(() =>
  import('./pages/OverviewPage').then((m) => ({ default: m.OverviewPage }))
);
const AnalyzerPage = React.lazy(() =>
  import('./pages/AnalyzerPage').then((m) => ({ default: m.AnalyzerPage }))
);
const HiddenRiskPage = React.lazy(() =>
  import('./pages/HiddenRiskPage').then((m) => ({ default: m.HiddenRiskPage }))
);
const SiteRiskPage = React.lazy(() =>
  import('./pages/SiteRiskPage').then((m) => ({ default: m.SiteRiskPage }))
);
const PrecursorGraphPage = React.lazy(() =>
  import('./pages/PrecursorGraphPage').then((m) => ({ default: m.PrecursorGraphPage }))
);
const DriftAlertsPage = React.lazy(() =>
  import('./pages/DriftAlertsPage').then((m) => ({ default: m.DriftAlertsPage }))
);
const TriagePage = React.lazy(() =>
  import('./pages/TriagePage').then((m) => ({ default: m.TriagePage }))
);
const EvaluationPage = React.lazy(() =>
  import('./pages/EvaluationPage').then((m) => ({ default: m.EvaluationPage }))
);

const PageLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[360px] space-y-3">
    <div className="w-8 h-8 border-2 border-petrol-600 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs text-graphite-500 font-mono">Loading workspace module...</span>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <FilterProvider>
          <DrawerProvider>
            <React.Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                <Route element={<AppShell />}>
                  <Route path="/" element={<Navigate to="/overview" replace />} />
                  <Route path="/overview" element={<OverviewPage />} />
                  <Route path="/analyze" element={<AnalyzerPage />} />
                  <Route path="/hidden-risk" element={<HiddenRiskPage />} />
                  <Route path="/risk-ranking" element={<SiteRiskPage />} />
                  <Route path="/precursor-graph" element={<PrecursorGraphPage />} />
                  <Route path="/drift" element={<DriftAlertsPage />} />
                  <Route path="/triage" element={<TriagePage />} />
                  <Route path="/evaluation" element={<EvaluationPage />} />
                  <Route path="*" element={<Navigate to="/overview" replace />} />
                </Route>
              </Routes>
            </React.Suspense>
          </DrawerProvider>
        </FilterProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
