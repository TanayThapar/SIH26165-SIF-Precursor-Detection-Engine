import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FilterProvider } from './context/FilterContext';
import { DrawerProvider } from './context/DrawerContext';
import { AppShell } from './components/layout/AppShell';

import { OverviewPage } from './pages/OverviewPage';
import { AnalyzerPage } from './pages/AnalyzerPage';
import { HiddenRiskPage } from './pages/HiddenRiskPage';
import { SiteRiskPage } from './pages/SiteRiskPage';
import { PrecursorGraphPage } from './pages/PrecursorGraphPage';
import { DriftAlertsPage } from './pages/DriftAlertsPage';
import { TriagePage } from './pages/TriagePage';
import { EvaluationPage } from './pages/EvaluationPage';

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
          </DrawerProvider>
        </FilterProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
