import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CompanyProvider } from './contexts/CompanyContext';
import { MainLayout } from './layouts/MainLayout';

import { LoginPage } from './pages/LoginPage';
import { NewReportPage } from './pages/NewReportPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { CompanySettingsPage } from './pages/CompanySettingsPage';
import { LoadingSpinner } from './components/common/UIComponents';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Verificando sesión..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/historial" replace />} />
        <Route path="nuevo" element={<NewReportPage />} />
        <Route path="historial" element={<HistoryPage />} />
        <Route path="informe/:id" element={<ReportDetailPage />} />
        <Route path="configuracion" element={<CompanySettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompanyProvider>
          <AppContent />
        </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
