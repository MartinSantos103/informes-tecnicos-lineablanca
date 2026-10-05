import React, { useState } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySettingsSchema, CompanyFormData } from '../utils/validation';
import { Input, TextArea, Button, Card } from '../components/common/UIComponents';
import {
  Building,
  Save,
  CheckCircle2,
  XCircle,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  X,
} from 'lucide-react';

export const CompanySettingsPage: React.FC = () => {
  const { company, updateCompany } = useCompany();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    action: 'SAVE';
    dataToSave?: CompanyFormData;
  }>({ show: false, action: 'SAVE' });

  const [toast, setToast] = useState<{ show: boolean; message: string; type?: 'success' | 'cancel' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      name: company?.name || '',
      logo_url: company?.logo_url || '',
      address: company?.address || '',
      phone: company?.phone || '',
      email: company?.email || '',
      website: company?.website || '',
      legal_notice:
        company?.legal_notice ||
        'Esta estimación no es un contrato o factura. Es nuestra mejor conjetura en el precio total para realizar el trabajo en base a una inspección inicial, la cual esta sujeta a cambios, según requieran piezas o trabajos adicionales, los cuales se comunican oportunamente.',
    },
  });

  const logoUrl = watch('logo_url');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setValue('logo_url', event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Interceptar envío del formulario para mostrar modal
  const handleBeforeSubmit = (data: CompanyFormData) => {
    setConfirmModal({ show: true, action: 'SAVE', dataToSave: data });
  };

  const handleCancelModal = () => {
    setConfirmModal({ show: false, action: 'SAVE' });
    setToast({ show: true, message: 'Operación cancelada', type: 'cancel' });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  const handleExecuteAction = async () => {
    const action = confirmModal.action;
    const pendingData = confirmModal.dataToSave;
    setConfirmModal({ show: false, action: 'SAVE' });
    setIsSubmitting(true);

    try {
      if (action === 'SAVE' && pendingData) {
        await updateCompany(pendingData);
        setToast({ show: true, message: 'Datos cambiados correctamente', type: 'success' });
      }
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
    } catch (err: any) {
      alert('Error en la operación: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* CABECERA */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Building className="w-6 h-6 text-brand-600" />
          Configuración de la Empresa
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Estos datos son fijos y aparecerán en el membrete y pie de página de todos los PDFs generados.
        </p>
      </div>

      {/* MODAL UNIFICADO DE CONFIRMACIÓN */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={handleCancelModal}
          />
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10 space-y-4 border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl flex items-center justify-center bg-brand-50 text-brand-600">
                <Save className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Confirmar Cambios
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Los datos cargados previamente en los campos editados se sobreescribirán y no será posible acceder a ellos mediante este programa. Siempre será posible restaurar los datos a un estado inicial por defecto.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancelModal}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                className="px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700"
              >
                <Save className="w-3.5 h-3.5" /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST DE NOTIFICACIÓN DE OPERACIÓN */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 text-xs font-medium">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <XCircle className="w-4 h-4 text-amber-400" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast((t) => ({ ...t, show: false }))}
            className="ml-2 text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(handleBeforeSubmit)} className="space-y-6">
        {/* IDENTIDAD CORPORATIVA */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Identidad Corporativa y Logo
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <Input
              label="Nombre de la Empresa"
              required
              placeholder="Ej: Mi Empresa S.A."
              error={errors.name?.message}
              icon={<Building className="w-4 h-4" />}
              {...register('name')}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Logotipo Corporativo (PDF)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors border border-slate-300"
                >
                  <ImageIcon className="w-4 h-4 text-brand-600" />
                  Subir Imagen
                </label>
                {logoUrl ? (
                  <div className="flex items-center gap-1.5">
                    <img src={logoUrl} alt="Logo Prev" className="h-9 max-w-[120px] object-contain rounded border bg-slate-50 p-1" />
                    <button
                      type="button"
                      onClick={() => setValue('logo_url', '')}
                      title="Eliminar logotipo"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400">Sin logo (se usará texto)</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                <span className="font-semibold text-slate-700">Medidas recomendadas:</span> Formato horizontal 3:1 (aprox. <span className="font-medium text-slate-800">600 × 200 px</span> o superior). Formato PNG con fondo transparente o JPG de alta calidad para garantizar nitidez en el PDF y la cabecera.
              </p>
            </div>
          </div>
        </Card>

        {/* CONTACTO Y DIRECCIÓN */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Datos de Contacto y Ubicación
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Dirección Comercial"
              required
              placeholder="Ej: Av. Corrientes 1234, CABA"
              error={errors.address?.message}
              icon={<MapPin className="w-4 h-4" />}
              {...register('address')}
            />

            <Input
              label="Teléfono Comercial / WhatsApp"
              required
              placeholder="Ej: +54 11 5555-0199"
              error={errors.phone?.message}
              icon={<Phone className="w-4 h-4" />}
              {...register('phone')}
            />

            <Input
              label="Correo Electrónico Oficial"
              required
              type="email"
              placeholder="Ej: contacto@miempresa.com"
              error={errors.email?.message}
              icon={<Mail className="w-4 h-4" />}
              {...register('email')}
            />

            <Input
              label="Sitio Web"
              placeholder="Ej: www.miempresa.com"
              error={errors.website?.message}
              icon={<Globe className="w-4 h-4" />}
              {...register('website')}
            />
          </div>
        </Card>

        {/* NOTA LEGAL PDF */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-brand-600" /> Nota Legal del Presupuesto
          </h3>

          <TextArea
            label="Texto Legal (Pie de página en PDF)"
            required
            rows={3}
            helperText="Ejemplo: Esta estimación no constituye una factura ni contrato de prestación de servicios."
            error={errors.legal_notice?.message}
            {...register('legal_notice')}
          />
        </Card>

        {/* BARRA DE BOTONES DE ACCIÓN */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            type="submit"
            size="lg"
            variant="primary"
            isLoading={isSubmitting}
            icon={<Save className="w-5 h-5" />}
            className="w-full sm:w-auto"
          >
            Guardar Configuración
          </Button>
        </div>
      </form>
    </div>
  );
};
