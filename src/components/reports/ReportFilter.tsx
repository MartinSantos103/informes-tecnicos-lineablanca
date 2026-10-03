import React from 'react';
import { FilterOptions, EQUIPMENT_TYPES } from '../../types';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface ReportFilterProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  totalCount: number;
}

export const ReportFilter: React.FC<ReportFilterProps> = ({
  filters,
  setFilters,
  totalCount,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E4DFD3] p-3.5 sm:p-4 space-y-3 shadow-sm">
      {/* Buscador general */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
          placeholder="Buscar por cliente, teléfono, N° informe, marca, diagnóstico..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
        />
        {filters.searchQuery && (
          <button
            onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Selectores de Filtros en Grilla */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Filtro por Equipo */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Tipo de Equipo
          </label>
          <select
            value={filters.equipment}
            onChange={(e) => setFilters((prev) => ({ ...prev, equipment: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-brand-500 focus:outline-none"
          >
            <option value="ALL">Todos los Equipos</option>
            {EQUIPMENT_TYPES.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        </div>

        {/* Ordenamiento */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" /> Ordenar por
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: e.target.value as FilterOptions['sortBy'],
              }))
            }
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-brand-500 focus:outline-none"
          >
            <option value="date_desc">Más recientes primero</option>
            <option value="date_asc">Más antiguos primero</option>
            <option value="number_desc">N° Informe (Descendente)</option>
            <option value="cost_desc">Mayor Costo Estimado</option>
            <option value="cost_asc">Menor Costo Estimado</option>
          </select>
        </div>
      </div>
    </div>
  );
};
