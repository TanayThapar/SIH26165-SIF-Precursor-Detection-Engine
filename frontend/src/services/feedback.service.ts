import { getApiClient } from '../api/client';
import { ReviewerFeedbackPayload } from '../api/contracts';
import { SafetyReport } from '../types/report';

export async function submitReviewerFeedback(payload: ReviewerFeedbackPayload): Promise<SafetyReport> {
  return getApiClient().submitFeedback(payload);
}
