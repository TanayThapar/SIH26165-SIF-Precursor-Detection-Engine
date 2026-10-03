import { LifeSavingRule, BarrierState, ReviewStatus } from './report';

export interface GlobalFilterState {
  searchQuery: string;
  startDate?: string;
  endDate?: string;
  site?: string;
  activity?: string;
  lifeSavingRule?: LifeSavingRule | 'ALL';
  barrierState?: BarrierState | 'ALL';
  reviewStatus?: ReviewStatus | 'ALL';
  minHiddenRisk?: number;
  sifOnly?: boolean;
}

export const DEFAULT_FILTER_STATE: GlobalFilterState = {
  searchQuery: '',
  site: 'ALL',
  activity: 'ALL',
  lifeSavingRule: 'ALL',
  barrierState: 'ALL',
  reviewStatus: 'ALL',
  sifOnly: false,
};
