import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reportFormSchema, ReportFormData } from '../../utils/validation';
import { TechnicalReport, CreateReportDTO, EQUIPMENT_TYPES, POPULAR_BRANDS } from '../../types';
import { Input, TextArea, Select, Button, Card } from '../common/UIComponents';
import { reportService } from '../../services/reportService';
import { FileCheck, FilePenLine, User, MapPin, Phone, Mail, Wrench, AlertCircle, HelpCircle, DollarSign, Calendar } from 'lucide-react';

interface ReportFormProps {
  initialValues?: TechnicalReport;
  onSubmit: (data: CreateReportDTO) => Promise<void>;
  isLoading?: boolean;
  submitButtonText?: string;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  initialValues,
  onSubmit,
  isLoading = false,
  submitButtonText = 'Generar Informe Técnico PDF',
}) => {
  const [estimatedReportNumber, setEstimatedReportNumber] = useState<string>(
    initialValues?.report_number || '...'
  );

  useEffect(() => {
    if (!initialValues) {
      reportService.getNextReportNumber().then((num) => setEstimatedReportNumber(num));
    }
  }, [initialValues]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      date: initialValues?.date || new Date().toISOString().split('T')[0],
      client_name: initialValues?.client_name || '',
      address: initialValues?.address || '',
      phone: initialValues?.phone || '',
      email: initialValues?.email || '',
      brand: initialValues?.brand || 'Whirlpool',
      model: initialValues?.model || '',
      equipment: initialValues?.equipment || 'Lavarropas',
      serial_number: initialValues?.serial_number && initialValues.serial_number !== '-' ? initialValues.serial_number : '',
      diagnosis: initialValues?.diagnosis || '',
      cause: initialValues?.cause || '',
      work_description: initialValues?.work_description || '',
      estimated_cost: initialValues?.estimated_cost || 0,
    },
  });

  const selectedBrand = watch('brand');

  const onFormSubmit = async (data: ReportFormData) => {
    await onSubmit({
      ...data,
      company_id: initialValues?.company_id,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 pb-20 sm:pb-6">
      {/* TARJETA CABECERA: Número de Estimación y Fecha de Emisión */}
      <div className="bg-white border border-[#E4DFD3] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <FilePenLine className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Informe Técnico
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-200">
                #{estimatedReportNumber}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Presupuesto e informe de servicio técnico oficial.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
          <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 leading-none mb-0.5">
              Fecha de Emisión
            </span>
            <input
              type="date"
              {...register('date')}
              className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: DATOS DEL CLIENTE */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
            <User className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">1. Datos del Cliente</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nombre y Apellido del Cliente"
            placeholder="Ej: Carlos Rodríguez"
            required
            error={errors.client_name?.message}
            icon={<User className="w-4 h-4" />}
            {...register('client_name')}
          />

          <Input
            label="Teléfono de Contacto (WhatsApp)"
            placeholder="Ej: +54 9 11 4433-2211"
            required
            error={errors.phone?.message}
            icon={<Phone className="w-4 h-4" />}
            {...register('phone')}
          />

          <Input
            label="Dirección del Servicio"
            placeholder="Ej: Calle Moldes 2140, Belgrano"
            required
            error={errors.address?.message}
            icon={<MapPin className="w-4 h-4" />}
            {...register('address')}
          />

          <Input
            label="Correo Electrónico (Opcional)"
            placeholder="Ej: cliente@gmail.com"
            type="email"
            error={errors.email?.message}
            icon={<Mail className="w-4 h-4" />}
            {...register('email')}
          />
        </div>
      </Card>

      {/* SECCIÓN 2: DATOS DEL EQUIPO DE LÍNEA BLANCA */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
            <Wrench className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">2. Datos del Electrodoméstico</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Tipo de Equipo"
            required
            options={EQUIPMENT_TYPES}
            error={errors.equipment?.message}
            {...register('equipment')}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Marca <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Whirlpool, Samsung, Drean..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              {...register('brand')}
            />
            {/* Quick selector buttons for brands */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {POPULAR_BRANDS.slice(0, 6).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setValue('brand', b)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium border transition-colors ${
                    selectedBrand === b
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            {errors.brand?.message && (
              <p className="text-xs text-rose-600 font-medium mt-1">{errors.brand.message}</p>
            )}
          </div>

          <Input
            label="Modelo del Equipo"
            placeholder="Ej: WLB12A 8kg / RT38K"
            required
            error={errors.model?.message}
            {...register('model')}
          />

          <Input
            label="N° de Serie (Opcional)"
            placeholder="Ej: SN-9823412 (o dejar vacío)"
            error={errors.serial_number?.message}
            {...register('serial_number')}
          />
        </div>
      </Card>

      {/* SECCIÓN 3: DIAGNÓSTICO, CAUSA Y TRABAJO TÉCNICO */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
            <AlertCircle className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">3. Informe y Análisis Técnico</h3>
        </div>

        <div className="space-y-4">
          <TextArea
            label="Diagnóstico Técnico (Descripción de la Falla)"
            placeholder="Detallar la falla detectada en la inspección (ej: Placa electrónica quemada en circuito de bomba, fuga de gas refrigerante)..."
            required
            rows={3}
            error={errors.diagnosis?.message}
            {...register('diagnosis')}
          />

          <TextArea
            label="Causa del Origen de la Falla"
            placeholder="Detallar textualmente el motivo u origen por el cual se produjo la falla (ej: Sobretensión en la red eléctrica, corrosión en cañerías por humedad, desgaste por uso prolongado)..."
            required
            rows={3}
            error={errors.cause?.message}
            {...register('cause')}
          />

          <TextArea
            label="Trabajo Recomendado a Realizar / Repuestos"
            placeholder="Detallar repuestos a sustituir y mano de obra (ej: Reemplazo de placa electrónica original, sustitución de electrobomba de desagote)..."
            required
            rows={3}
            error={errors.work_description?.message}
            {...register('work_description')}
          />
        </div>
      </Card>

      {/* SECCIÓN 4: COSTO ESTIMADO */}
      <Card className="space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">4. Presupuesto</h3>
        </div>

        <div>
          <Input
            label="Costo Estimado / Presupuesto Total ($ ARS)"
            placeholder="Ej: 85000"
            type="number"
            step="100"
            required
            error={errors.estimated_cost?.message}
            icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
            {...register('estimated_cost')}
          />
        </div>
      </Card>

      {/* BOTÓN DE ACCIÓN PRINCIPAL */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-end">
        <Button
          type="submit"
          size="lg"
          variant="primary"
          isLoading={isLoading}
          icon={<FileCheck className="w-5 h-5" />}
          className="w-full sm:w-auto text-base py-3.5 shadow-xl shadow-brand-600/30"
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};
