import React from 'react';
import { TechnicalReport } from '../../types';
import { formatCurrency, formatDateSpanish } from '../../utils/formatters';
import { FileText, Eye, Download, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShare } from '../../hooks/useShare';
import { useCompany } from '../../contexts/CompanyContext';
import { useAuth } from '../../contexts/AuthContext';

interface ReportCardProps {
  report: TechnicalReport;
  onDeleteRequest?: (report: TechnicalReport) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onDeleteRequest }) => {
  const { company } = useCompany();
  const { downloadPDF, isSharing } = useShare();
  const { user } = useAuth();

  return (
    <div className="bg-white rounded-2xl border border-[#E4DFD3] shadow-sm hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between space-y-4">
      {/* Encabezado N° Informe */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xs">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Informe #{report.report_number}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {formatDateSpanish(report.date)}
            </span>
          </div>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => onDeleteRequest && onDeleteRequest(report)}
            title="Eliminar Informe"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Cliente y Detalles del Equipo */}
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-slate-400 font-medium block text-[10px] uppercase">Cliente</span>
          <p className="font-semibold text-slate-800 text-sm">{report.client_name}</p>
          <p className="text-slate-500 truncate">{report.address} • {report.phone}</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-2.5 grid grid-cols-2 gap-2 border border-slate-100">
          <div>
            <span className="text-slate-400 font-medium text-[10px] block uppercase">Equipo</span>
            <span className="font-semibold text-slate-900">{report.equipment}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium text-[10px] block uppercase">Marca / Modelo</span>
            <span className="font-medium text-slate-700">{report.brand} {report.model}</span>
          </div>
        </div>

        <div>
          <span className="text-slate-400 font-medium text-[10px] block uppercase">Diagnóstico</span>
          <p className="text-slate-600 line-clamp-2 italic text-[11px]">"{report.diagnosis}"</p>
        </div>
      </div>

      {/* Costo Estimado & Acciones */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 font-medium block uppercase">Presupuesto</span>
          <span className="text-base font-bold text-brand-700">
            {formatCurrency(report.estimated_cost)}
          </span>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-2">
          <Link
            to="/nuevo"
            state={{ duplicateReport: report }}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all"
            title="Editar Informe (Crear copia)"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-500" />
            <span>Editar</span>
          </Link>

          <Link
            to={`/informe/${report.id}`}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all"
            title="Ver Detalle e Informe"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Ver</span>
          </Link>

          <button
            onClick={() => {
              if (company) downloadPDF(report, company);
            }}
            disabled={isSharing || !company}
            title="Descargar Informe PDF"
            className="px-3.5 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Descargar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
