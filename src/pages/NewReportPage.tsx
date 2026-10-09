import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ReportForm } from '../components/reports/ReportForm';
import { useReports } from '../hooks/useReports';
import { CreateReportDTO, TechnicalReport } from '../types';
import { FilePlus } from 'lucide-react';

export const NewReportPage: React.FC = () => {
  const { createReport } = useReports();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Leer estado si venimos del botón de "Editar" en el historial
  const duplicateReport = location.state?.duplicateReport as TechnicalReport | undefined;

  // Remover id y report_number para que se genere uno nuevo al guardar
  const initialValues = duplicateReport
    ? { ...duplicateReport, id: undefined, report_number: undefined, created_at: undefined, updated_at: undefined }
    : undefined;

  const handleCreate = async (data: CreateReportDTO) => {
    setIsSubmitting(true);
    try {
      const created = await createReport(data);
      // Redireccionar directamente a la vista previa del PDF generado
      navigate(`/informe/${created.id}`);
    } catch (err: any) {
      alert('Error al crear el informe: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER DE PAGINA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FilePlus className="w-6 h-6 text-brand-600" />
            {duplicateReport ? 'Editar Informe Técnico' : 'Crear Nuevo Informe Técnico'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {duplicateReport
              ? 'Modifica los campos necesarios para generar el nuevo informe.'
              : 'Completa con los datos del servicio tecnico provisto al cliente.'}
          </p>
        </div>
      </div>

      {/* FORMULARIO PRINCIPAL */}
      <ReportForm
        initialValues={initialValues}
        onSubmit={handleCreate}
        isLoading={isSubmitting}
        submitButtonText="Guardar PDF"
      />
    </div>
  );
};
