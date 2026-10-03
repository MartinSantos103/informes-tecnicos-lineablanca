import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Card } from '../components/common/UIComponents';
import { Wrench, Lock, Mail, LogIn, Eye, EyeOff, FilePenLine } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { company } = useCompany();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Revisa tu email y contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">
      {/* Cabecera del Login */}
      <header className="w-full px-6 py-4 bg-brand-900 border-b border-brand-800 flex items-center gap-3 text-white shadow-md">
        <div className="text-brand-300">
          {company?.logo_url ? (
            <img src={company.logo_url} alt="Logo" className="h-8 max-w-[120px] object-contain rounded bg-white p-1" />
          ) : (
            <FilePenLine className="w-6 h-6 text-brand-300" />
          )}
        </div>
        <span className="font-bold text-white text-lg tracking-tight">Informes Técnicos</span>
      </header>

      {/* Cuerpo Central con contraste en tono crema suave */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#FAF8F5] via-[#F4F1EA] to-[#ECE7DC]">
        <div className="w-full max-w-md">
          {/* TARJETA DE LOGIN */}
          <Card className="shadow-2xl shadow-stone-900/10 border border-[#E4DFD3] overflow-hidden rounded-2xl bg-white !p-0">
            <div className="px-8 pt-8 pb-6 text-center border-b border-[#F0ECE1] bg-white">
               <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 shadow-sm mx-auto mb-3">
                 <Wrench className="w-6 h-6" />
               </div>
               <h2 className="text-2xl font-bold text-slate-900">Bienvenido</h2>
               <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                 Ingrese a su panel para gestionar y emitir sus informes técnicos.
               </p>
            </div>
            
            <div className="px-8 py-6 space-y-5 bg-white">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Correo Electrónico"
                  type="email"
                  required
                  placeholder="tu-email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                />

                <Input
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-700 focus:outline-none p-1 rounded-md transition-colors"
                      title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                />

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    Mantener sesión iniciada
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  icon={<LogIn className="w-4 h-4" />}
                  className="w-full shadow-lg shadow-brand-500/25"
                >
                  Iniciar Sesión
                </Button>
              </form>
            </div>
          </Card>
          
          <footer className="text-center text-[11px] text-stone-500 font-medium mt-6">
            © {new Date().getFullYear()} {company?.name || 'Sistema de Informes'}. Todos los derechos reservados.
          </footer>
        </div>
      </div>
    </div>
  );
};
