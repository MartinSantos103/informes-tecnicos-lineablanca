import React from 'react';
import { Header } from '../components/common/Header';
import { NavigationBar } from '../components/common/NavigationBar';
import { Outlet } from 'react-router-dom';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] bg-gradient-to-b from-[#FAF8F5] via-[#F4F1EA] to-[#ECE7DC] text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
      <Header />
      <NavigationBar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 pb-24 sm:pb-8">
        <Outlet />
      </main>
    </div>
  );
};
