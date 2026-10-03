import { getApiClient } from '../api/client';
import { PrecursorGraphData } from '../types/graph';
import { GlobalFilterState } from '../types/filters';

export async function fetchPrecursorGraph(filters?: GlobalFilterState): Promise<PrecursorGraphData> {
  return getApiClient().getPrecursorGraph(filters);
}
