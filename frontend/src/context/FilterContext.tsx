import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GlobalFilterState, DEFAULT_FILTER_STATE } from '../types/filters';

interface FilterContextType {
  filters: GlobalFilterState;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilterState>>;
  updateFilter: <K extends keyof GlobalFilterState>(key: K, value: GlobalFilterState[K]) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from URL search params if present
  const [filters, setFilters] = useState<GlobalFilterState>(() => {
    return {
      searchQuery: searchParams.get('q') || DEFAULT_FILTER_STATE.searchQuery,
      site: searchParams.get('site') || DEFAULT_FILTER_STATE.site,
      activity: searchParams.get('activity') || DEFAULT_FILTER_STATE.activity,
      lifeSavingRule: (searchParams.get('lsr') as any) || DEFAULT_FILTER_STATE.lifeSavingRule,
      barrierState: (searchParams.get('barrier') as any) || DEFAULT_FILTER_STATE.barrierState,
      reviewStatus: (searchParams.get('status') as any) || DEFAULT_FILTER_STATE.reviewStatus,
      sifOnly: searchParams.get('sif') === 'true',
    };
  });

  // Sync state back to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.searchQuery) params.set('q', filters.searchQuery);
    if (filters.site && filters.site !== 'ALL') params.set('site', filters.site);
    if (filters.activity && filters.activity !== 'ALL') params.set('activity', filters.activity);
    if (filters.lifeSavingRule && filters.lifeSavingRule !== 'ALL') params.set('lsr', filters.lifeSavingRule);
    if (filters.barrierState && filters.barrierState !== 'ALL') params.set('barrier', filters.barrierState);
    if (filters.reviewStatus && filters.reviewStatus !== 'ALL') params.set('status', filters.reviewStatus);
    if (filters.sifOnly) params.set('sif', 'true');

    // Replace without pushing to browser history on every keystroke
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const updateFilter = <K extends keyof GlobalFilterState>(key: K, value: GlobalFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTER_STATE);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery?.trim()) count++;
    if (filters.site && filters.site !== 'ALL') count++;
    if (filters.activity && filters.activity !== 'ALL') count++;
    if (filters.lifeSavingRule && filters.lifeSavingRule !== 'ALL') count++;
    if (filters.barrierState && filters.barrierState !== 'ALL') count++;
    if (filters.reviewStatus && filters.reviewStatus !== 'ALL') count++;
    if (filters.sifOnly) count++;
    return count;
  }, [filters]);

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        activeFilterCount,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export function useGlobalFilters(): FilterContextType {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useGlobalFilters must be used within a FilterProvider');
  }
  return context;
}
