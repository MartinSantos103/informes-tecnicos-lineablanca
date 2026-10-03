import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportForm } from '../components/reports/ReportForm';
import { useReports } from '../hooks/useReports';
import { CreateReportDTO } from '../types';
import { FilePlus } from 'lucide-react';

export const NewReportPage: React.FC = () => {
  const { createReport } = useReports();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            Crear Nuevo Informe Técnico
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Completa con los datos del servicio tecnico provisto al cliente.
          </p>
        </div>
      </div>

      {/* FORMULARIO PRINCIPAL */}
      <ReportForm
        onSubmit={handleCreate}
        isLoading={isSubmitting}
        submitButtonText="Guardar y Generar PDF"
      />
    </div>
  );
};
