import React, { createContext, useContext, useState } from 'react';
import { SafetyReport } from '../types/report';
import { fetchReportById } from '../services';

interface DrawerContextType {
  openReport: (reportOrId: SafetyReport | string) => Promise<void>;
  closeReport: () => void;
  activeReport: SafetyReport | null;
  isDrawerOpen: boolean;
  onReportUpdated: (updated: SafetyReport) => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeReport, setActiveReport] = useState<SafetyReport | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openReport = async (reportOrId: SafetyReport | string) => {
    if (typeof reportOrId === 'string') {
      try {
        const found = await fetchReportById(reportOrId);
        setActiveReport(found);
        setIsDrawerOpen(true);
      } catch (err) {
        console.error('Failed to load report for drawer', err);
      }
    } else {
      setActiveReport(reportOrId);
      setIsDrawerOpen(true);
    }
  };

  const closeReport = () => {
    setIsDrawerOpen(false);
  };

  const onReportUpdated = (updated: SafetyReport) => {
    setActiveReport(updated);
  };

  return (
    <DrawerContext.Provider
      value={{
        openReport,
        closeReport,
        activeReport,
        isDrawerOpen,
        onReportUpdated,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};

export function useReportDrawer(): DrawerContextType {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useReportDrawer must be used within a DrawerProvider');
  }
  return context;
}
