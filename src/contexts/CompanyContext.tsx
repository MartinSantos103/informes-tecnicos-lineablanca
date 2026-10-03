import React, { createContext, useContext, useEffect, useState } from 'react';
import { Company } from '../types';
import { reportService } from '../services/reportService';
import { useAuth } from './AuthContext';

interface CompanyContextType {
  company: Company | null;
  isLoading: boolean;
  updateCompany: (data: Partial<Company>) => Promise<Company>;
  resetCompany: () => Promise<Company>;
  refreshCompany: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadCompany = async () => {
    setIsLoading(true);
    try {
      const data = await reportService.getCompany();
      setCompany(data);
    } catch {
      setCompany(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      loadCompany();
    } else {
      setCompany(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const updateCompany = async (data: Partial<Company>) => {
    const updated = await reportService.updateCompany(data);
    setCompany(updated);
    return updated;
  };

  const resetCompany = async () => {
    const resetData = await reportService.resetCompany();
    setCompany(resetData);
    return resetData;
  };

  return (
    <CompanyContext.Provider
      value={{
        company,
        isLoading,
        updateCompany,
        resetCompany,
        refreshCompany: loadCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany debe usarse dentro de CompanyProvider');
  }
  return context;
};

