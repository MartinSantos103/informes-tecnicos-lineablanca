import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCompany } from '../../contexts/CompanyContext';
import { LogOut, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { company } = useCompany();
  const [logoError, setLogoError] = useState(false);

  // Determinar si hay un nombre propio que no sea el mismo email
  const isEmail = (str?: string) => Boolean(str && str.includes('@'));
  const hasDistinctName = Boolean(
    user?.full_name &&
    user.full_name.trim().toLowerCase() !== user.email.trim().toLowerCase() &&
    !isEmail(user.full_name)
  );

  const hasLogo = Boolean(company?.logo_url && company.logo_url.trim() !== '' && !logoError);

  return (
    <header className="sticky top-0 z-30 bg-brand-900 border-b border-brand-800 text-white shadow-md px-4 py-3 sm:px-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group">
          {hasLogo && (
            <img 
              src={company?.logo_url} 
              alt={`Logo de ${company?.name || 'la empresa'}`} 
              onError={() => setLogoError(true)}
              className="h-9 max-w-[120px] object-contain rounded-md bg-white p-1 shadow-sm transition-transform group-hover:scale-105"
            />
          )}
          <div>
            <h1 className="text-base font-bold text-white leading-tight group-hover:text-brand-200 transition-colors">
              {company?.name || 'Sistema de Informes'}
            </h1>
            <p className="text-[11px] text-brand-300 font-medium">Panel de Gestión</p>
          </div>
        </Link>

        {/* User Controls */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                {hasDistinctName ? (
                  <>
                    <span className="text-xs font-bold text-white">{user.full_name}</span>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-brand-300" />
                      <span className="text-[11px] font-medium text-brand-200">
                        {user.email}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-end gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-300" />
                    <span className="text-xs font-semibold text-white">
                      {user.email}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={logout}
                title="Cerrar Sesión"
                className="p-2 text-brand-200 hover:text-white hover:bg-brand-800 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
