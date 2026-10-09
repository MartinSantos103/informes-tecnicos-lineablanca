import React, { createContext, useContext, useEffect, useState } from 'react';
import { Company } from '../types';
import { reportService } from '../services/reportService';
import { useAuth } from './AuthContext';

interface CompanyContextType {
  company: Company | null;
  isLoading: boolean;
  updateCompany: (data: Partial<Company>) => Promise<Company>;
  refreshCompany: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
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
  }, [isAuthenticated, authLoading, user?.company_id]);

  const updateCompany = async (data: Partial<Company>) => {
    const updated = await reportService.updateCompany(data);
    setCompany(updated);
    return updated;
  };

  return (
    <CompanyContext.Provider
      value={{
        company,
        isLoading,
        updateCompany,
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

