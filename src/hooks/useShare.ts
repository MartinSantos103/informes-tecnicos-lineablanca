import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { TechnicalReport, Company } from '../types';
import { TechnicalReportPDF } from '../pdf/TechnicalReportPDF';

export const useShare = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  /**
   * Generar Blob del PDF
   */
  const generatePDFBlob = async (report: TechnicalReport, company: Company): Promise<Blob> => {
    const doc = React.createElement(TechnicalReportPDF, { report, company });
    const pdfInstance = pdf(doc as any);
    return await pdfInstance.toBlob();
  };

  /**
   * Descargar PDF localmente
   */
  const downloadPDF = async (report: TechnicalReport, company: Company) => {
    try {
      setIsSharing(true);
      const blob = await generatePDFBlob(report, company);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Informe_Tecnico_${report.report_number}_${report.client_name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setShareError(err.message || 'Error al descargar PDF');
    } finally {
      setIsSharing(false);
    }
  };

  /**
   * Abrir PDF en una nueva pestaña (Ideal para móviles)
   */
  const openPDF = async (report: TechnicalReport, company: Company) => {
    try {
      setIsSharing(true);
      const blob = await generatePDFBlob(report, company);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Limpiar URL después de un tiempo para evitar fugas de memoria
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    } catch (err: any) {
      setShareError(err.message || 'Error al abrir PDF');
    } finally {
      setIsSharing(false);
    }
  };

  return {
    isSharing,
    shareError,
    downloadPDF,
    openPDF,
  };
};
