import { IApiClient, ReviewerFeedbackPayload } from '../contracts';
import {
  SafetyReport,
  AnalysisRequestPayload,
  AnalysisResponseResult,
  SeverityLevel,
  SEVERITY_LEVELS,
} from '../../types/report';
import {
  AnalyticsOverviewData,
  SiteRiskRanking,
  ActivityRiskRanking,
} from '../../types/analytics';
import { DriftAlert, DriftWeeklyTimeSeries } from '../../types/drift';
import { PrecursorGraphData } from '../../types/graph';
import { ModelEvaluationSummary } from '../../types/evaluation';
import { GlobalFilterState } from '../../types/filters';

import { ALL_SAFETY_REPORTS } from '../../mocks/reportsData';
import { MOCK_OVERVIEW_DATA } from '../../mocks/overview';
import { MOCK_SITE_RANKINGS, MOCK_ACTIVITY_RANKINGS } from '../../mocks/rankings';
import { MOCK_DRIFT_ALERTS, MOCK_DRIFT_TIMESERIES } from '../../mocks/drift';
import { MOCK_PRECURSOR_GRAPH } from '../../mocks/graph';
import { MOCK_EVALUATION_SUMMARY } from '../../mocks/evaluation';

const STORAGE_KEY_FEEDBACK = 'sif_engine_feedback_store_v1';
const STORAGE_KEY_DRIFT = 'sif_engine_drift_store_v1';
const STORAGE_KEY_EVAL_STATE = 'sif_engine_eval_trained_v1';

// In-memory working copies
let reportsStore: SafetyReport[] = [...ALL_SAFETY_REPORTS];
let driftAlertsStore: DriftAlert[] = [...MOCK_DRIFT_ALERTS];
let evalSummaryStore: ModelEvaluationSummary = { ...MOCK_EVALUATION_SUMMARY };

// Initialize from localStorage if available
try {
  const savedFeedback = localStorage.getItem(STORAGE_KEY_FEEDBACK);
  if (savedFeedback) {
    const parsed: Record<string, Partial<SafetyReport>> = JSON.parse(savedFeedback);
    reportsStore = reportsStore.map((r) => (parsed[r.id] ? { ...r, ...parsed[r.id] } : r));
  }
  const savedDrift = localStorage.getItem(STORAGE_KEY_DRIFT);
  if (savedDrift) {
    const parsed: Record<string, Partial<DriftAlert>> = JSON.parse(savedDrift);
    driftAlertsStore = driftAlertsStore.map((d) => (parsed[d.id] ? { ...d, ...parsed[d.id] } : d));
  }
  const savedEval = localStorage.getItem(STORAGE_KEY_EVAL_STATE);
  if (savedEval !== null) {
    evalSummaryStore.isModelTrained = savedEval === 'true';
  }
} catch {
  // localStorage unavailable or restricted
}

function delay(ms: number = 80): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function applyReportFilters(reports: SafetyReport[], filters?: GlobalFilterState): SafetyReport[] {
  if (!filters) return reports;

  return reports.filter((r) => {
    // Search query matches ID, text, site, activity, equipment, or LSR
    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        r.id.toLowerCase().includes(q) ||
        r.originalText.toLowerCase().includes(q) ||
        r.site.toLowerCase().includes(q) ||
        r.activity.toLowerCase().includes(q) ||
        (r.equipment && r.equipment.toLowerCase().includes(q)) ||
        r.lifeSavingRules.some((lsr) => lsr.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Site filter
    if (filters.site && filters.site !== 'ALL' && r.site !== filters.site) {
      return false;
    }

    // Activity filter
    if (filters.activity && filters.activity !== 'ALL' && !r.activity.toLowerCase().includes(filters.activity.toLowerCase())) {
      return false;
    }

    // Life-Saving Rule
    if (filters.lifeSavingRule && filters.lifeSavingRule !== 'ALL') {
      if (!r.lifeSavingRules.includes(filters.lifeSavingRule)) {
        return false;
      }
    }

    // Barrier state
    if (filters.barrierState && filters.barrierState !== 'ALL') {
      if (r.barrier.state !== filters.barrierState) {
        return false;
      }
    }

    // Review status
    if (filters.reviewStatus && filters.reviewStatus !== 'ALL') {
      if (r.reviewStatus !== filters.reviewStatus) {
        return false;
      }
    }

    // Min Hidden Risk
    if (typeof filters.minHiddenRisk === 'number') {
      if (r.hiddenRisk < filters.minHiddenRisk) {
        return false;
      }
    }

    // SIF only
    if (filters.sifOnly && !r.sifFlag) {
      return false;
    }

    return true;
  });
}

export class MockApiAdapter implements IApiClient {
  async getOverview(filters?: GlobalFilterState): Promise<AnalyticsOverviewData> {
    await delay(100);
    const filteredReports = applyReportFilters(reportsStore, filters);
    const sifReports = filteredReports.filter((r) => r.sifFlag);
    const highHiddenRisk = filteredReports.filter((r) => r.hiddenRisk >= 3);
    const awaitingReview = filteredReports.filter(
      (r) => r.reviewStatus === 'review_required' || r.reviewStatus === 'auto_escalated'
    );

    const hasActiveFilters =
      filters &&
      Boolean(
        filters.searchQuery ||
          (filters.site && filters.site !== 'ALL') ||
          (filters.activity && filters.activity !== 'ALL') ||
          (filters.lifeSavingRule && filters.lifeSavingRule !== 'ALL') ||
          (filters.barrierState && filters.barrierState !== 'ALL') ||
          (filters.reviewStatus && filters.reviewStatus !== 'ALL') ||
          filters.sifOnly
      );

    return {
      ...MOCK_OVERVIEW_DATA,
      kpis: {
        ...MOCK_OVERVIEW_DATA.kpis,
        totalReports: hasActiveFilters ? filteredReports.length : MOCK_OVERVIEW_DATA.kpis.totalReports,
        sifPotentialReports: hasActiveFilters ? sifReports.length : MOCK_OVERVIEW_DATA.kpis.sifPotentialReports,
        sifPotentialRate: hasActiveFilters
          ? filteredReports.length > 0
            ? Number((sifReports.length / filteredReports.length).toFixed(3))
            : 0
          : MOCK_OVERVIEW_DATA.kpis.sifPotentialRate,
        highHiddenRiskReports: hasActiveFilters
          ? highHiddenRisk.length
          : MOCK_OVERVIEW_DATA.kpis.highHiddenRiskReports,
        activeDriftAlerts: driftAlertsStore.filter(
          (d) => d.status === 'Open' || d.status === 'Under Review'
        ).length,
        reportsAwaitingReview: awaitingReview.length,
      },
    };
  }

  async getReports(filters?: GlobalFilterState): Promise<SafetyReport[]> {
    await delay(90);
    return applyReportFilters(reportsStore, filters);
  }

  async getReportById(id: string): Promise<SafetyReport> {
    await delay(60);
    const found = reportsStore.find((r) => r.id === id);
    if (!found) {
      throw new Error(`Report with ID "${id}" was not found in the safety database.`);
    }
    return found;
  }

  async analyzeReport(payload: AnalysisRequestPayload): Promise<AnalysisResponseResult> {
    await delay(350); // Simulate realistic multi-stage inference pipeline
    const rawText = payload.reportText.trim();
    if (!rawText) {
      throw new Error('Report text is required for SIF precursor analysis.');
    }

    // 1. Outcome Masking Lexicon
    const outcomePhrases = [
      /no injury occurred[.,]?/i,
      /technician was unharmed[.,]?/i,
      /worker was unharmed[.,]?/i,
      /nobody was hurt[.,]?/i,
      /zero injury[.,]?/i,
      /zero casualties[.,]?/i,
      /first aid plaster applied[.,]?/i,
      /worker suffered no permanent disability[.,]?/i,
      /escaped with zero harm[.,]?/i,
      /no contact or injuries[.,]?/i,
      /completely unhurt[.,]?/i,
      /no personal contact[.,]?/i,
      /no fall occurred[.,]?/i,
    ];

    let maskedText = rawText;
    let removedOutcome = 'No explicit outcome phrase detected';

    for (const regex of outcomePhrases) {
      const match = rawText.match(regex);
      if (match) {
        removedOutcome = match[0];
        maskedText = rawText.replace(regex, '[OUTCOME]');
        break;
      }
    }

    // 2. High Energy Source Heuristics
    const lower = rawText.toLowerCase();
    let energy: SafetyReport['energySource'] = 'None / Minimal';
    let energyDesc = 'Low energy routine environment';
    if (lower.includes('suspended') || lower.includes('crane') || lower.includes('hoist') || lower.includes('sling') || lower.includes('fall') || lower.includes('scaffold') || lower.includes('height')) {
      energy = 'Gravity (Falling Objects / Falls)';
      energyDesc = 'High gravitational energy (suspended load or height elevation)';
    } else if (lower.includes('volt') || lower.includes('electrical') || lower.includes('breaker') || lower.includes('shutter') || lower.includes('busbar') || lower.includes('arc')) {
      energy = 'Electrical (High / Low Voltage)';
      energyDesc = 'Electrical energy capable of fatal flash or electrocution';
    } else if (lower.includes('psi') || lower.includes('pressure') || lower.includes('hammer union') || lower.includes('nitrogen') || lower.includes('choke')) {
      energy = 'Pressure / Pressurized Fluids';
      energyDesc = 'Pressurized containment rupture / missile hazard';
    } else if (lower.includes('gas') || lower.includes('h2s') || lower.includes('flame') || lower.includes('weld') || lower.includes('hot work') || lower.includes('crude')) {
      energy = 'Chemical / Toxic / Flammable';
      energyDesc = 'Flammable hydrocarbons or acute toxic atmospheric gas pocket';
    } else if (lower.includes('excavator') || lower.includes('truck') || lower.includes('vehicle') || lower.includes('reverse')) {
      energy = 'Motion / Vehicle Impact';
      energyDesc = 'Heavy mobile machinery motion / crushing potential';
    } else if (lower.includes('spring') || lower.includes('tension') || lower.includes('chain') || lower.includes('nip') || lower.includes('belt')) {
      energy = 'Stored Mechanical / Tension';
      energyDesc = 'High stored mechanical energy or rotating pinch point';
    }

    // 3. Exposure Assessment
    const personInHazardZone = lower.includes('worker') || lower.includes('technician') || lower.includes('roughneck') || lower.includes('operator') || lower.includes('mechanic') || lower.includes('personnel');
    const lineOfFire = lower.includes('beneath') || lower.includes('under') || lower.includes('inside') || lower.includes('line of fire') || lower.includes('meter') || lower.includes('contact');

    // 4. Barrier Compromise Assessment
    const barrierCompromised = lower.includes('slip') || lower.includes('fail') || lower.includes('fell') || lower.includes('bypassed') || lower.includes('missing') || lower.includes('without') || lower.includes('open') || lower.includes('unclipped');

    // 5. Life-Saving Rule Mapping
    const matchedLsrs: SafetyReport['lifeSavingRules'] = [];
    if (lower.includes('suspended') || lower.includes('sling') || lower.includes('hoist') || lower.includes('crane')) matchedLsrs.push('Safe Mechanical Lifting');
    if (lower.includes('line of fire') || lower.includes('under') || lower.includes('beneath') || lower.includes('swing') || lower.includes('shrapnel')) matchedLsrs.push('Line of Fire');
    if (lower.includes('electrical') || lower.includes('loto') || lower.includes('isolation') || lower.includes('breaker') || lower.includes('switchgear')) matchedLsrs.push('Energy Isolation');
    if (lower.includes('confined space') || lower.includes('sump') || lower.includes('tank') || lower.includes('h2s') || lower.includes('vessel')) matchedLsrs.push('Confined Space');
    if (lower.includes('height') || lower.includes('scaffold') || lower.includes('ladder') || lower.includes('lanyard') || lower.includes('derrick')) matchedLsrs.push('Working at Height');
    if (lower.includes('hot work') || lower.includes('weld') || lower.includes('torch') || lower.includes('spark')) matchedLsrs.push('Hot Work');
    if (lower.includes('permit') || lower.includes('ptw') || lower.includes('authorization')) matchedLsrs.push('Work Authorization');
    if (lower.includes('driving') || lower.includes('excavator') || lower.includes('truck') || lower.includes('vehicle')) matchedLsrs.push('Driving');
    if (lower.includes('bypassed') || lower.includes('guard') || lower.includes('unclipped') || lower.includes('without')) matchedLsrs.push('Bypassing Safety Controls');

    if (matchedLsrs.length === 0) matchedLsrs.push('None / Non-LSR');

    // 6. Neuro-Symbolic Combiner
    const isHighEnergy = energy !== 'None / Minimal';
    const symbolicRuleTriggered = isHighEnergy && personInHazardZone && barrierCompromised;
    const learnedScore = isHighEnergy ? (barrierCompromised ? 0.92 : 0.65) : 0.15;
    const combinedSifScore = symbolicRuleTriggered ? Math.max(learnedScore, 0.88) : learnedScore;

    const potentialSeverity: SeverityLevel = combinedSifScore >= 0.8 ? 6 : combinedSifScore >= 0.5 ? 4 : 2;
    const actualSeverity: SeverityLevel = payload.loggedSeverity || 1;
    const hiddenRisk = potentialSeverity - actualSeverity;

    const reportId = `OIL-INSPECT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReport: SafetyReport = {
      id: reportId,
      date: new Date().toISOString().split('T')[0],
      site: payload.site || 'Duliajan Drilling Rig 04',
      plant: 'Operational Site',
      location: 'Active Work Zone',
      activity: payload.activity || (matchedLsrs[0] !== 'None / Non-LSR' ? matchedLsrs[0] : 'General Operations'),
      equipment: payload.equipment || 'Field Equipment',
      originalText: rawText,
      maskedText: maskedText,
      outcomePhraseRemoved: removedOutcome,
      actualSeverity,
      actualSeverityLabel: `${SEVERITY_LEVELS[actualSeverity]?.code} — ${SEVERITY_LEVELS[actualSeverity]?.label}`,
      potentialSeverity,
      potentialSeverityLabel: `${SEVERITY_LEVELS[potentialSeverity]?.code} — ${SEVERITY_LEVELS[potentialSeverity]?.label}`,
      hiddenRisk,
      sifProbability: Number(combinedSifScore.toFixed(2)),
      sifFlag: combinedSifScore >= 0.7,
      riskBand: combinedSifScore >= 0.85 ? 'Critical SIF' : combinedSifScore >= 0.7 ? 'High SIF' : 'Medium SIF',
      lifeSavingRules: matchedLsrs,
      energySource: energy,
      exposure: {
        personExposed: personInHazardZone,
        lineOfFire,
        hazardZone: personInHazardZone,
        distance: 'Within direct line-of-fire hazard envelope',
        peopleCount: 1,
      },
      barrier: {
        state: barrierCompromised ? 'Failed' : 'Held',
        type: 'Engineering',
        identifiedBarrier: 'Primary physical control / procedural verification',
      },
      evidence: [
        { id: 'ev-an-1', category: 'ENERGY', text: energy, startIndex: 0, endIndex: 15, interpretation: energyDesc, severityInfluence: 'increases_potential' },
        { id: 'ev-an-2', category: 'EXPOSURE', text: lineOfFire ? 'Line of Fire Exposure' : 'Worker Proximity', startIndex: 16, endIndex: 30, interpretation: 'Personnel located in hazardous zone during release', severityInfluence: 'increases_potential' },
        { id: 'ev-an-3', category: 'BARRIER', text: barrierCompromised ? 'Barrier Defect / Compromise' : 'Mitigating Control Held', startIndex: 31, endIndex: 50, interpretation: 'Barrier status evaluated against IOGP standards', severityInfluence: barrierCompromised ? 'increases_potential' : 'decreases_potential' },
        { id: 'ev-an-4', category: 'OUTCOME', text: removedOutcome, startIndex: 51, endIndex: 70, interpretation: 'Outcome bias phrase isolated and masked', severityInfluence: 'outcome_leakage' },
      ],
      reasoning: {
        highEnergyIdentified: isHighEnergy,
        energyDescription: energyDesc,
        personExposed: personInHazardZone,
        exposureDescription: 'Personnel present in line of fire / hazard perimeter',
        barrierCompromised,
        barrierDescription: barrierCompromised ? 'Primary barrier failed, bypassed, or absent' : 'Controls in place',
        learnedModelScore: Number(learnedScore.toFixed(2)),
        symbolicRuleTriggered,
        combinedSifScore: Number(combinedSifScore.toFixed(2)),
        modelConfidence: 'High',
        modelRuleDisagreement: false,
      },
      reviewStatus: combinedSifScore >= 0.85 ? 'auto_escalated' : 'review_required',
      provenance: {
        source: 'Live Client Inference Session',
        synthetic: true,
        labelSource: 'synthetic',
      },
    };

    return {
      report: newReport,
      latencyMs: 142,
      modelVersion: 'DeBERTa-v3-Multitask-v1.4 (Neuro-Symbolic)',
      pipelineStages: {
        normalizationMs: 18,
        maskingMs: 22,
        extractionMs: 44,
        multitaskMs: 38,
        neuroSymbolicMs: 20,
      },
    };
  }

  async getSiteRankings(filters?: GlobalFilterState): Promise<SiteRiskRanking[]> {
    await delay(80);
    if (!filters || filters.site === 'ALL') {
      return MOCK_SITE_RANKINGS;
    }
    return MOCK_SITE_RANKINGS.filter((s) => s.siteName === filters.site);
  }

  async getActivityRankings(filters?: GlobalFilterState): Promise<ActivityRiskRanking[]> {
    await delay(80);
    if (!filters || filters.activity === 'ALL') {
      return MOCK_ACTIVITY_RANKINGS;
    }
    return MOCK_ACTIVITY_RANKINGS.filter((a) =>
      a.activityName.toLowerCase().includes(filters.activity!.toLowerCase())
    );
  }

  async getHiddenRiskReports(filters?: GlobalFilterState): Promise<SafetyReport[]> {
    await delay(90);
    const reports = applyReportFilters(reportsStore, filters);
    // Sort descending by Hidden Risk
    return [...reports].sort((a, b) => b.hiddenRisk - a.hiddenRisk);
  }

  async getPrecursorGraph(filters?: GlobalFilterState): Promise<PrecursorGraphData> {
    await delay(120);
    return MOCK_PRECURSOR_GRAPH;
  }

  async getDriftAlerts(filters?: GlobalFilterState): Promise<DriftAlert[]> {
    await delay(70);
    if (!filters || filters.site === 'ALL') {
      return driftAlertsStore;
    }
    return driftAlertsStore.filter((d) => d.site === filters.site);
  }

  async getDriftTimeSeries(alertId?: string): Promise<DriftWeeklyTimeSeries[]> {
    await delay(70);
    return MOCK_DRIFT_TIMESERIES;
  }

  async updateDriftStatus(
    alertId: string,
    status: DriftAlert['status'],
    acknowledgedBy: string = 'HSE Controller'
  ): Promise<DriftAlert> {
    await delay(60);
    const index = driftAlertsStore.findIndex((d) => d.id === alertId);
    if (index === -1) {
      throw new Error(`Drift alert ${alertId} not found.`);
    }

    driftAlertsStore[index] = {
      ...driftAlertsStore[index],
      status,
      acknowledgedBy,
      acknowledgedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    try {
      const persisted: Record<string, Partial<DriftAlert>> = {};
      driftAlertsStore.forEach((d) => {
        persisted[d.id] = { status: d.status, acknowledgedBy: d.acknowledgedBy, acknowledgedAt: d.acknowledgedAt };
      });
      localStorage.setItem(STORAGE_KEY_DRIFT, JSON.stringify(persisted));
    } catch {
      // ignore storage err
    }

    return driftAlertsStore[index];
  }

  async getEvaluationMetrics(): Promise<ModelEvaluationSummary> {
    await delay(90);
    return evalSummaryStore;
  }

  async setEvaluationTrainedState(isTrained: boolean): Promise<ModelEvaluationSummary> {
    await delay(50);
    evalSummaryStore = {
      ...evalSummaryStore,
      isModelTrained: isTrained,
      statusMessage: isTrained
        ? 'Model weights initialized and validated on held-out proxy test split.'
        : 'Model evaluation is unavailable because no trained model weights exist in this environment.',
    };
    try {
      localStorage.setItem(STORAGE_KEY_EVAL_STATE, String(isTrained));
    } catch {
      // ignore
    }
    return evalSummaryStore;
  }

  async submitFeedback(payload: ReviewerFeedbackPayload): Promise<SafetyReport> {
    await delay(120);
    const index = reportsStore.findIndex((r) => r.id === payload.reportId);
    if (index === -1) {
      throw new Error(`Report ${payload.reportId} not found.`);
    }

    const current = reportsStore[index];
    let newStatus: SafetyReport['reviewStatus'] = 'reviewed_correct';
    if (payload.action === 'correct') newStatus = 'reviewed_corrected';
    if (payload.action === 'escalate') newStatus = 'auto_escalated';
    if (payload.action === 'dismiss') newStatus = 'dismissed';

    const updated: SafetyReport = {
      ...current,
      reviewStatus: newStatus,
      reviewerNotes: payload.notes,
      reviewedBy: payload.reviewerName || 'HSE Specialist',
      reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sifFlag: payload.correctedValues?.sifFlag !== undefined ? payload.correctedValues.sifFlag : current.sifFlag,
      potentialSeverity: (payload.correctedValues?.potentialSeverity as SeverityLevel) || current.potentialSeverity,
      hiddenRisk:
        ((payload.correctedValues?.potentialSeverity as SeverityLevel) || current.potentialSeverity) - current.actualSeverity,
    };

    reportsStore[index] = updated;

    try {
      const persisted: Record<string, Partial<SafetyReport>> = {};
      reportsStore.forEach((r) => {
        if (r.reviewerNotes || r.reviewStatus !== 'auto_escalated') {
          persisted[r.id] = {
            reviewStatus: r.reviewStatus,
            reviewerNotes: r.reviewerNotes,
            reviewedBy: r.reviewedBy,
            reviewedAt: r.reviewedAt,
            sifFlag: r.sifFlag,
            potentialSeverity: r.potentialSeverity,
            hiddenRisk: r.hiddenRisk,
          };
        }
      });
      localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(persisted));
    } catch {
      // ignore
    }

    return updated;
  }
}
