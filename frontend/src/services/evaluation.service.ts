import { getApiClient } from '../api/client';
import { ModelEvaluationSummary } from '../types/evaluation';

export async function fetchEvaluationMetrics(): Promise<ModelEvaluationSummary> {
  return getApiClient().getEvaluationMetrics();
}

export async function toggleEvaluationTrainedState(isTrained: boolean): Promise<ModelEvaluationSummary> {
  return getApiClient().setEvaluationTrainedState(isTrained);
}
