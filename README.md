# SIF Precursor Detection Engine
### Smart India Hackathon — SIH26165 | Oil India Limited

> **"The absence of injury does not imply the absence of fatal potential."**

---

## 1. Product Overview

The **SIF Precursor Detection Engine** is an industrial safety analytics and AI/NLP platform built for **Oil India Limited (OIL)** under **Smart India Hackathon problem statement SIH26165**.

In oil & gas drilling, workover, and pipeline operations, incident reports frequently include outcome-biased statements such as:
- *"No injury occurred"*
- *"First aid administered"*
- *"Worker stepped away in time"*
- *"Near miss with zero equipment damage"*

Conventional NLP models erroneously correlate these harmless outcome descriptions with low severity. **Our platform separates WHAT HAPPENED from WHAT COULD HAVE HAPPENED** by applying an outcome-masked representation of each report before estimating potential severity.

### Signature Concept: Hidden Risk
For every incident report, the system computes:
$$\text{Hidden Risk} = \text{Predicted Potential Severity} - \text{Actual Severity}$$
A high positive Hidden Risk value ($\Delta \ge +3$) indicates an event where outcome was benign solely due to luck or chance, but where the physical energy release, worker exposure, and barrier compromise possessed catastrophic or fatal potential.

---

## 2. Navigable Workspaces & Modules

The platform includes 8 production-grade workspaces:

1. **Executive Overview (`/overview`)**
   - 5 KPI summary tiles with period comparisons (Total Volume, SIF Precursors, High Hidden-Risk Events, CUSUM Drift Signals, Pending HSE Review Queue).
   - Interactive SIF Precursor Rate Over Time trendline with CUSUM anomaly flags and 32% alarm limits.
   - Site risk ranking using empirical Bayes shrinkage.
   - Priority Hidden Risk Watchlist with instant drawer inspection.
   - Barrier failure breakdown and IOGP Life-Saving Rule distribution.

2. **Precursor Report Analyzer (`/analyze`)**
   - Dual-entry inspection: paste raw field observation text or select historical oilfield scenarios.
   - Dual-Lens Outcome Masking: side-by-side and stacked comparison of logged report vs. outcome-blind model attention.
   - Semantic Physical Evidence Highlighting: interactive tokens for Energy release, Line-of-Fire exposure, Barrier condition, and Operational context.
   - Neuro-Symbolic Explainability Stack: transparent breakdown of statistical neural NLP score, deterministic safety rule layer, combined calibrated score, and divergence alerts.

3. **Hidden Risk Distribution (`/hidden-risk`)**
   - Signature Severity Matrix Scatter Plot: $X = \text{Observed Outcome Severity}$, $Y = \text{Potential Precursor Severity}$ plotted against the $y = x$ baseline. Points furthest above the diagonal represent maximum hidden risk.
   - Dense sortable and paginated incident ledger with multi-criteria filtering.

4. **Site & Activity Risk Ranking (`/risk-ranking`)**
   - Empirical Bayes shrinkage-adjusted precursor rates across drilling rigs, compressor stations, and well clusters.
   - Protects against small-sample false alarms ($n < 20$) by shrinking noisy rates toward the enterprise prior mean ($\mu = 24.0\%$).
   - Operational activity breakdown (Mechanical Hoisting, Hot Work, Confined Space, Working at Height, Energy Isolation).

5. **Precursor Co-Occurrence Network (`/precursor-graph`)**
   - Multi-entity interactive graph mapping high-lift relationships between Activities, Energy Sources, Barrier Failures, and Life-Saving Rules.
   - Controls for minimum lift threshold slider ($1.5\times$ to $6.0\times$), entity search, zoom, and interactive detail inspector.

6. **Statistical Drift & Change Points (`/drift`)**
   - Time-series precursor drift monitoring using CUSUM and Page-Hinkley algorithms.
   - Detects systemic barrier breakdown surges before fatal loss-of-containment events occur.
   - Interactive 12-week time-series chart with preventative HSE intervention recommendations.

7. **HSE Triage & Review Queue (`/triage`)**
   - Human-in-the-loop review queue for auto-escalated incidents, review-required cases, and model-rule divergences.
   - Split-pane review drawer enabling HSE officers to confirm SIF designations, override severity levels, and record audit notes.

8. **Model Evaluation & Benchmark Honesty (`/evaluation`)**
   - Comparative benchmark table: TF-IDF Baseline vs. Outcome-Aware DeBERTa vs. Outcome-Blind Multitask vs. Neuro-Symbolic Engine.
   - Highlights reduction in outcome bias leakage ($38.6\% \to 2.1\%$).
   - Precision-Recall curves, confusion matrices, and per-LSR accuracy breakdown.
   - Non-fake data guarantee: supports toggling to an untrained state to verify empty-state handling.

---

## 3. Architecture & Data Layer

```
frontend/
├── src/
│   ├── api/
│   │   ├── contracts.ts          # Strongly-typed IApiClient interface & DTOs
│   │   ├── client.ts             # Runtime adapter selector (Mock vs. Live API)
│   │   └── adapters/
│   │       ├── mock.adapter.ts   # Realistic demonstration data & localStorage persistence
│   │       └── http.adapter.ts   # REST adapter connecting to Python FastAPI backend
│   ├── components/
│   │   ├── layout/AppShell.tsx   # Left rail navigation, top contextual bar, global banner
│   │   ├── reports/ReportDrawer.tsx # Slide-out inspector for any report ID
│   │   ├── filters/GlobalFilterDrawer.tsx # Shared multi-criteria filter modal
│   │   ├── modals/BackendSwitcherModal.tsx # Live API toggle and health ping
│   │   └── ui/                   # Semantic indicators, badges, and explainability cards
│   ├── pages/                    # 8 complete workspace views
│   ├── services/                 # Decoupled business service layer
│   ├── context/                  # Global FilterContext & DrawerContext
│   └── types/                    # Domain data contracts (Report, Analytics, Drift, Graph)
```

---

## 4. Run & Build Instructions

### Prerequisites
- Node.js $\ge 18$
- npm $\ge 9$

### Install Dependencies
```bash
cd frontend
npm install
```

### Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173`.

### Run Test Suite
```bash
npm test
```
Executes all 8 unit tests in `src/__tests__/sifEngine.test.ts`.

### Production Build
```bash
npm run build
```
Typechecks with TypeScript and compiles production bundle using Vite.

---

## 5. Backend Integration (FastAPI)

To connect the frontend to a real backend:
1. In `src/api/client.ts` or via the in-app **Backend Adapter Configuration** modal (`Adapter Settings`), toggle active mode to `Live REST API`.
2. Configure the API Base URL (defaults to `http://localhost:8000`).
3. The backend should implement the endpoints defined in `src/api/contracts.ts`:
   - `GET /overview`
   - `GET /reports`
   - `GET /reports/:id`
   - `POST /analyze`
   - `GET /rankings/sites`
   - `GET /rankings/activities`
   - `GET /hidden-risk`
   - `GET /precursor-graph`
   - `GET /drift`
   - `GET /drift/timeseries`
   - `PATCH /drift/:id/status`
   - `GET /evaluation`
   - `POST /feedback`

---

## 6. Data Provenance & Ethics
- All sample reports provided in mock mode are explicitly tagged with `sourceType: 'synthetic'`.
- A persistent top banner informs operators: *"Operating on realistic synthetic safety reports — not Oil India operational live data."*
- Model evaluation metrics reflect public proxy benchmark sets and held-out test splits, preventing unvalidated accuracy claims.
