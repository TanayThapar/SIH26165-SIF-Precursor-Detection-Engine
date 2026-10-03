import React, { useState } from 'react';
import { X, Server, Database, CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { getDataMode } from '../../api/client';

interface BackendSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendSwitcherModal: React.FC<BackendSwitcherModalProps> = ({ isOpen, onClose }) => {
  const currentMode = getDataMode();
  const [targetMode, setTargetMode] = useState<'mock' | 'api'>(currentMode);
  const [apiUrl, setApiUrl] = useState<string>(
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  );
  const [testingHealth, setTestingHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{
    tested: boolean;
    online: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestingHealth(true);
    setHealthStatus(null);
    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, '')}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setHealthStatus({
          tested: true,
          online: true,
          message: 'Backend API is online and responding healthy (200 OK).',
        });
      } else {
        setHealthStatus({
          tested: true,
          online: false,
          message: `Backend returned status ${res.status}: ${res.statusText}`,
        });
      }
    } catch (err: any) {
      setHealthStatus({
        tested: true,
        online: false,
        message: `Connection failed: ${err.message || 'Cannot reach host'}. Is the FastAPI backend running?`,
      });
    } finally {
      setTestingHealth(false);
    }
  };

  const handleApply = () => {
    // Save to localStorage or inform user
    localStorage.setItem('sif_data_mode', targetMode);
    localStorage.setItem('sif_api_url', apiUrl);
    // Reload if mode changed to instantiate client properly
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-graphite-950/50 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-surface rounded-lg border border-surface-border shadow-dropdown overflow-hidden z-10 animate-scaleUp">
        {/* Header */}
        <div className="p-4 bg-surface-raised border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-petrol-700" />
            <div>
              <h3 className="text-sm font-bold text-graphite-900">
                Backend Data Adapter Configuration
              </h3>
              <p className="text-xs text-graphite-500">
                Decoupled API Contract Layer • Oil India SIH26165
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-graphite-400 hover:text-graphite-700 hover:bg-surface-sunken"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-graphite-800 block mb-2">
              Select Active Data Adapter:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Mock Adapter */}
              <div
                onClick={() => setTargetMode('mock')}
                className={`p-3.5 rounded border cursor-pointer transition-all ${
                  targetMode === 'mock'
                    ? 'bg-petrol-50/70 border-petrol-600 ring-2 ring-petrol-600/30'
                    : 'bg-surface-sunken/40 border-surface-border hover:bg-surface-sunken'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-graphite-900 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-petrol-700" />
                    Mock Adapter
                  </span>
                  {targetMode === 'mock' && (
                    <CheckCircle2 className="w-4 h-4 text-petrol-700" />
                  )}
                </div>
                <p className="text-graphite-600 text-[11px] leading-relaxed">
                  Fast client-side simulation with 40+ realistic synthetic OIL incident reports, drift signals, and graph networks.
                </p>
              </div>

              {/* Option 2: Live HTTP API */}
              <div
                onClick={() => setTargetMode('api')}
                className={`p-3.5 rounded border cursor-pointer transition-all ${
                  targetMode === 'api'
                    ? 'bg-petrol-50/70 border-petrol-600 ring-2 ring-petrol-600/30'
                    : 'bg-surface-sunken/40 border-surface-border hover:bg-surface-sunken'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-graphite-900 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-petrol-700" />
                    Live REST API
                  </span>
                  {targetMode === 'api' && (
                    <CheckCircle2 className="w-4 h-4 text-petrol-700" />
                  )}
                </div>
                <p className="text-graphite-600 text-[11px] leading-relaxed">
                  Direct connection to Python FastAPI backend with NLP transformer inference and live DB endpoints.
                </p>
              </div>
            </div>
          </div>

          {/* Endpoint configuration for API mode */}
          {targetMode === 'api' && (
            <div className="space-y-2 pt-2 border-t border-surface-border animate-fadeIn">
              <label className="font-semibold text-graphite-700 block">
                Backend API Base URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="flex-1 font-mono text-xs p-2 rounded border border-surface-border bg-surface focus:outline-none focus:ring-1 focus:ring-petrol-600"
                />
                <button
                  type="button"
                  disabled={testingHealth}
                  onClick={handleTestConnection}
                  className="px-3 py-2 bg-surface-sunken border border-surface-border rounded font-medium text-graphite-700 hover:bg-surface-raised flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingHealth ? 'animate-spin' : ''}`} />
                  Test Ping
                </button>
              </div>

              {healthStatus && (
                <div
                  className={`p-2.5 rounded border text-[11px] flex items-start gap-2 ${
                    healthStatus.online
                      ? 'bg-operational-50 border-operational-300 text-operational-800'
                      : 'bg-signal-50 border-signal-300 text-signal-800'
                  }`}
                >
                  {healthStatus.online ? (
                    <CheckCircle2 className="w-4 h-4 text-operational-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-signal-600 shrink-0 mt-0.5" />
                  )}
                  <span>{healthStatus.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Backend Run Instructions */}
          <div className="bg-surface-sunken/60 p-3 rounded border border-surface-border text-[11px] text-graphite-600 space-y-1">
            <span className="font-semibold text-graphite-800 block uppercase tracking-wide text-[10px]">
              How to run Python FastAPI backend:
            </span>
            <code className="font-mono text-petrol-800 bg-surface px-1.5 py-0.5 rounded border border-surface-border block">
              cd backend && uvicorn app.main:app --reload --port 8000
            </code>
            <p className="text-[10px] text-graphite-500 pt-0.5">
              The frontend communicates via standard OpenAPI contracts defined in <span className="font-mono">src/api/contracts.ts</span>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-raised border-t border-surface-border flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-graphite-600 hover:text-graphite-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-1.5 bg-petrol-700 hover:bg-petrol-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Apply & Reload
          </button>
        </div>
      </div>
    </div>
  );
};
