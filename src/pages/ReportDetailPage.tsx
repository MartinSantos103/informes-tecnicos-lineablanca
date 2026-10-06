import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TechnicalReport } from '../types';
import { reportService } from '../services/reportService';
import { useCompany } from '../contexts/CompanyContext';
import { useShare } from '../hooks/useShare';
import { Button, LoadingSpinner, Card } from '../components/common/UIComponents';
import {
  FileText,
  Download,
  ArrowLeft,
  User,
  Wrench,
  AlertCircle,
  Copy,
  Check,
  Eye,
} from 'lucide-react';
import { formatCurrency, formatDateSpanish } from '../utils/formatters';
import { PDFViewer } from '@react-pdf/renderer';
import { TechnicalReportPDF } from '../pdf/TechnicalReportPDF';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { company } = useCompany();
  const { isSharing, downloadPDF, openPDF } = useShare();

  const [report, setReport] = useState<TechnicalReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'pdf'>('pdf');
  const [copied, setCopied] = useState(false);

  const loadReport = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await reportService.getReportById(id);
      setReport(data);
    } catch {
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [id]);

  const handleCopyText = () => {
    if (!report || !company) return;

    const plainText = 
`🛠️ ${company.name.toUpperCase()} - INFORME TÉCNICO N° #${report.report_number}
Fecha de Emisión: ${formatDateSpanish(report.date)}

👤 DATOS DEL CLIENTE:
• Nombre: ${report.client_name}
• Dirección: ${report.address}
• Teléfono: ${report.phone}${report.email ? `\n• Email: ${report.email}` : ''}

🧊 DATOS DEL EQUIPO:
• Tipo: ${report.equipment}
• Marca: ${report.brand}
• Modelo: ${report.model}
• N° de Serie: ${report.serial_number || '-'}

🔍 DIAGNÓSTICO TÉCNICO:
${report.diagnosis}

⚡ CAUSA DEL ORIGEN DE LA FALLA:
${report.cause}

⚙️ TRABAJO RECOMENDADO / REPUESTOS:
${report.work_description}

💰 PRESUPUESTO ESTIMADO: ${formatCurrency(report.estimated_cost)}

---
${company.name} • Tel: ${company.phone} • Email: ${company.email}`;

    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (isLoading) return <LoadingSpinner message="Cargando datos del informe..." />;

  if (!company) return null;

  if (!report) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Informe no encontrado</h2>
        <Button variant="outline" onClick={() => navigate('/historial')} icon={<ArrowLeft className="w-4 h-4" />}>
          Volver al Historial
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BOTÓN VOLVER Y CABECERA ACCIONES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/historial')}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Informe #{report.report_number}</h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Cliente: {report.client_name} • {formatDateSpanish(report.date)}
            </p>
          </div>
        </div>

        {/* BARRA DE ACCIÓN: SOLO DESCARGAR PDF */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadPDF(report, company)}
            disabled={isSharing}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* TOGGLE PESTAÑAS: PDF PREVIEW vs VISTA DETALLADA */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pdf')}
          className={`py-3 px-6 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'pdf'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Vista Previa PDF Oficial
        </button>

        <button
          onClick={() => setActiveTab('details')}
          className={`py-3 px-6 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'details'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Datos del Trabajo
        </button>
      </div>

      {/* TAB 1: PDF VIEWER EMBEDDED */}
      {activeTab === 'pdf' && (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-2xl p-2 sm:p-4 shadow-xl border border-slate-700">
            {/* Escritorio: PDFViewer embebido */}
            <div className="hidden sm:block h-[700px] w-full rounded-xl overflow-hidden bg-white">
              <PDFViewer width="100%" height="100%" showToolbar={true}>
                <TechnicalReportPDF report={report} company={company} />
              </PDFViewer>
            </div>

            {/* Mobile: Tarjeta con botón para abrir en nueva pestaña */}
            <div className="sm:hidden text-center p-6 bg-white rounded-xl space-y-3">
              <FileText className="w-12 h-12 text-brand-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">
                PDF Generado Vectorial N° #{report.report_number}
              </h3>
              <p className="text-xs text-slate-500">
                Abre el informe para previsualizarlo o descárgalo directamente a tu dispositivo.
              </p>
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => openPDF(report, company)}
                  icon={<Eye className="w-4 h-4" />}
                >
                  Abrir Vista Previa
                </Button>
                <Button
                  variant="primary"
                  onClick={() => downloadPDF(report, company)}
                  icon={<Download className="w-4 h-4" />}
                >
                  Descargar PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETALLES DE TEXTO CON BOTÓN DE COPIAR TEXTO */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BANNER / BOTÓN PARA COPIAR EN FORMATO TEXTO */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:col-span-2 border border-slate-700">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                <FileText className="w-4 h-4 text-brand-400" />
                Resumen en Formato Texto Plano
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Copia la información técnica estructurada para pegarla en mensajes o notas.
              </p>
            </div>
            <button
              onClick={handleCopyText}
              className={`w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-600 hover:bg-brand-500 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Texto Copiado!' : 'Copiar en texto'}</span>
            </button>
          </div>

          {/* Cliente */}
          <Card className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-600" /> Cliente
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              <p><span className="font-semibold text-slate-500">Nombre:</span> {report.client_name}</p>
              <p><span className="font-semibold text-slate-500">Dirección:</span> {report.address}</p>
              <p><span className="font-semibold text-slate-500">Teléfono:</span> {report.phone}</p>
              {report.email && <p><span className="font-semibold text-slate-500">Email:</span> {report.email}</p>}
            </div>
          </Card>

          {/* Equipo */}
          <Card className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-brand-600" /> Equipo
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              <p><span className="font-semibold text-slate-500">Tipo:</span> {report.equipment}</p>
              <p><span className="font-semibold text-slate-500">Marca:</span> {report.brand}</p>
              <p><span className="font-semibold text-slate-500">Modelo:</span> {report.model}</p>
              <p><span className="font-semibold text-slate-500">N° de Serie:</span> {report.serial_number || '-'}</p>
            </div>
          </Card>

          {/* Diagnóstico */}
          <Card className="space-y-2 md:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-brand-600" /> Diagnóstico Técnico
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">{report.diagnosis}</p>
          </Card>

          {/* Causa de la Falla */}
          <Card className="space-y-2 md:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" /> Causa del Origen de la Falla
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">{report.cause}</p>
          </Card>

          {/* Trabajo recomendado */}
          <Card className="space-y-2 md:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-brand-600" /> Trabajo Recomendado
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">{report.work_description}</p>
          </Card>

          {/* Presupuesto */}
          <Card className="space-y-2 md:col-span-2 bg-brand-50/60 border-brand-200 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-brand-800 uppercase block">Presupuesto Estimado</span>
              <span className="text-2xl font-black text-brand-700">
                {formatCurrency(report.estimated_cost)}
              </span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
