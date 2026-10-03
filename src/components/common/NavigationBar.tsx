import React from 'react';
import { NavLink } from 'react-router-dom';
import { FilePlus, History, Settings } from 'lucide-react';

export const NavigationBar: React.FC = () => {
  const navItems = [
    {
      to: '/nuevo',
      label: 'Nuevo Informe',
      icon: <FilePlus className="w-5 h-5" />,
    },
    {
      to: '/historial',
      label: 'Historial',
      icon: <History className="w-5 h-5" />,
    },
    {
      to: '/configuracion',
      label: 'Empresa',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* NAVEGACIÓN INFERIOR PARA MÓVILES (Sticky bottom) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E4DFD3] px-6 py-2 shadow-lg">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-brand-600 font-bold scale-105'
                    : 'text-stone-500 font-medium hover:text-stone-900'
                }`
              }
            >
              {item.icon}
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* NAVEGACIÓN EN ESCRITORIO (Header sub-bar) */}
      <div className="hidden sm:block bg-[#EFECE3]/80 backdrop-blur-md border-b border-[#E2DDD0] py-2 px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                    : 'text-stone-600 hover:bg-white hover:text-stone-900'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};
