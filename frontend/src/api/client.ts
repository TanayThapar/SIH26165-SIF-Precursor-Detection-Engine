import { IApiClient } from './contracts';
import { MockApiAdapter } from './adapters/mock.adapter';
import { HttpApiAdapter } from './adapters/http.adapter';

// Check environment mode: 'mock' | 'api'
const dataMode = import.meta.env.VITE_DATA_MODE || 'mock';

// Singleton instance
let activeClient: IApiClient =
  dataMode === 'api' ? new HttpApiAdapter() : new MockApiAdapter();

export function getApiClient(): IApiClient {
  return activeClient;
}

export function getDataMode(): 'mock' | 'api' {
  return (import.meta.env.VITE_DATA_MODE as 'mock' | 'api') || 'mock';
}

export function isMockMode(): boolean {
  return getDataMode() === 'mock';
}

export default getApiClient();
