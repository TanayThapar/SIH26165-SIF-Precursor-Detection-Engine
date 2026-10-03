import { describe, it, expect, beforeEach } from 'vitest';
import { MockApiAdapter } from '../api/adapters/mock.adapter';
import { SafetyReport } from '../types/report';

describe('SIF Precursor Detection Engine — Core Logic & Data Adapter', () => {
  let adapter: MockApiAdapter;

  beforeEach(() => {
    adapter = new MockApiAdapter();
  });

  it('1. Data Adapter: Retrieves overview KPIs and time series', async () => {
    const overview = await adapter.getOverview();
    expect(overview.kpis.totalReports).toBeGreaterThan(1000);
    expect(overview.kpis.sifPotentialReports).toBeGreaterThan(0);
    expect(overview.kpis.sifPotentialRate).toBeGreaterThan(0.2);
    expect(overview.timeSeries.length).toBeGreaterThan(5);
    expect(overview.topSites.length).toBeGreaterThan(0);
    expect(overview.barrierFailures.length).toBe(5);
    expect(overview.provenance.synthetic).toBe(true);
  });

  it('2. Signature Hidden Risk: Correctly computes Hidden Risk = Potential - Actual', async () => {
    const reports = await adapter.getHiddenRiskReports();
    expect(reports.length).toBeGreaterThan(0);

    for (const report of reports) {
      expect(report.hiddenRisk).toBe(report.potentialSeverity - report.actualSeverity);
      // High hidden risk reports should have potential > actual
      if (report.hiddenRisk >= 3) {
        expect(report.potentialSeverity).toBeGreaterThan(report.actualSeverity);
      }
    }
  });

  it('3. Report Analyzer: Strips outcome phrases and identifies physical hazard precursors', async () => {
    const sampleText =
      'Worker walked beneath suspended 2-ton casing collar. Sling slipped off hook. No injury occurred.';

    const result = await adapter.analyzeReport({
      reportText: sampleText,
      site: 'Duliajan Drilling Rig 04',
      activity: 'Safe Mechanical Lifting',
      loggedSeverity: 1,
    });

    expect(result.report).toBeDefined();
    // Outcome phrase should be decoupled from masked representation
    expect(result.report.maskedText).toContain('[OUTCOME]');
    expect(result.report.maskedText).not.toContain('No injury occurred');
    expect(result.report.outcomePhraseRemoved).toBe('No injury occurred.');

    // Precursor potential should reflect high energy & line of fire
    expect(result.report.potentialSeverity).toBeGreaterThanOrEqual(4);
    expect(result.report.actualSeverity).toBe(1);
    expect(result.report.hiddenRisk).toBeGreaterThanOrEqual(3);
    expect(result.report.lifeSavingRules).toContain('Safe Mechanical Lifting');
    expect(result.report.lifeSavingRules).toContain('Line of Fire');
  });

  it('4. Empirical Bayes Shrinkage: Shrinks low-sample sites toward global mean', async () => {
    const rankings = await adapter.getSiteRankings();
    expect(rankings.length).toBeGreaterThan(0);

    const smallSite = rankings.find((s) => s.sampleSizeTier.includes('Low') || s.totalReports < 30);
    if (smallSite) {
      const delta = Math.abs(smallSite.shrinkageAdjustedRate - smallSite.rawPrecursorRate);
      expect(delta).toBeGreaterThan(0);
    }
  });

  it('5. Precursor Graph: Returns co-occurrence lift network with lift > 1.0', async () => {
    const graph = await adapter.getPrecursorGraph();
    expect(graph.nodes.length).toBeGreaterThan(5);
    expect(graph.edges.length).toBeGreaterThan(5);

    // Verify all edges have high lift
    for (const edge of graph.edges) {
      expect(edge.lift).toBeGreaterThan(1.0);
      expect(edge.coOccurrenceCount).toBeGreaterThan(0);
    }
  });

  it('6. Drift Alerts: Detects CUSUM statistical change points with recommended interventions', async () => {
    const alerts = await adapter.getDriftAlerts();
    expect(alerts.length).toBeGreaterThan(0);

    const first = alerts[0];
    expect(first.cusumStatistic).toBeGreaterThan(first.thresholdValue);
    expect(first.currentRate).toBeGreaterThan(first.baselineRate);
    expect(first.recommendedAction).toBeDefined();
    expect(first.recommendedAction.length).toBeGreaterThan(10);
  });

  it('7. HSE Triage & Feedback: Submitting feedback updates review status', async () => {
    const reports = await adapter.getReports();
    const target = reports[0];

    const updated = await adapter.submitFeedback({
      reportId: target.id,
      action: 'correct',
      reviewerName: 'Lead HSE Inspector',
      notes: 'Verified dropped object hazard envelope; updated severity to Level VI.',
      correctedValues: {
        potentialSeverity: 6,
        sifFlag: true,
      },
    });

    expect(updated.reviewStatus).toBe('reviewed_corrected');
    expect(updated.potentialSeverity).toBe(6);
    expect(updated.reviewerNotes).toContain('Verified dropped object hazard envelope');
  });

  it('8. Model Evaluation & Benchmark Transparency: Toggling trained state respects data honesty', async () => {
    const trainedMetrics = await adapter.getEvaluationMetrics();
    expect(trainedMetrics.isModelTrained).toBe(true);
    expect(trainedMetrics.models.length).toBe(4);

    // Toggle untrained state
    const untrained = await adapter.setEvaluationTrainedState(false);
    expect(untrained.isModelTrained).toBe(false);
    expect(untrained.statusMessage).toContain('unavailable');

    // Restore trained state
    const restored = await adapter.setEvaluationTrainedState(true);
    expect(restored.isModelTrained).toBe(true);
  });
});
