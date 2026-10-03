import React from 'react';
import { useReports } from '../hooks/useReports';
import { ReportFilter } from '../components/reports/ReportFilter';
import { ReportCard } from '../components/reports/ReportCard';
import { LoadingSpinner, Button } from '../components/common/UIComponents';
import {
  History,
  FilePlus,
  Inbox,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HistoryPage: React.FC = () => {
  const {
    reports,
    totalCount,
    totalPages,
    page,
    setPage,
    isLoading,
    error,
    filters,
    setFilters,
  } = useReports(undefined, 8);

  const startRecord = totalCount === 0 ? 0 : (page - 1) * 8 + 1;
  const endRecord = Math.min(page * 8, totalCount);

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-brand-600" />
            Historial de Informes Técnicos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Consulta, filtra y vuelve a emitir o descargar los presupuestos e informes registrados.
          </p>
        </div>

        <Link to="/nuevo">
          <Button variant="primary" icon={<FilePlus className="w-4 h-4" />}>
            Nuevo Informe
          </Button>
        </Link>
      </div>

      {/* COMPONENTE DE FILTROS Y BÚSQUEDA */}
      <ReportFilter filters={filters} setFilters={setFilters} totalCount={totalCount} />

      {/* CONTENIDO DEL HISTORIAL */}
      {isLoading ? (
        <LoadingSpinner message="Cargando historial de informes..." />
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold text-center">
          {error}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No se encontraron informes</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {filters.searchQuery || filters.equipment !== 'ALL'
                ? 'Intenta modificar o limpiar los filtros de búsqueda aplicados.'
                : 'Aún no se ha registrado ningún informe técnico. ¡Crea el primero ahora!'}
            </p>
          </div>
          {(filters.searchQuery || filters.equipment !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({
                  searchQuery: '',
                  equipment: 'ALL',
                  sortBy: 'date_desc',
                })
              }
            >
              Restablecer Filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center px-1 text-xs text-slate-500 font-semibold gap-2">
            <span>
              Mostrando {startRecord} - {endRecord} de {totalCount} informes
            </span>
            <span>
              Página {page} de {totalPages}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>

          {/* CONTROLES DE NAVEGACIÓN Y PAGINACIÓN */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <span className="text-xs font-semibold text-slate-600">
              Página {page} de {totalPages}
            </span>

            <div className="flex items-center gap-1.5">
              {/* << Primera Página */}
              <button
                onClick={() => setPage(1)}
                disabled={page <= 1 || isLoading}
                title="Primera página"
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* < Página Anterior */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                title="Página anterior"
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1.5 text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 rounded-xl">
                {page} / {totalPages}
              </span>

              {/* > Página Siguiente */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
                title="Página siguiente"
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* >> Última Página */}
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages || isLoading}
                title="Última página"
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
