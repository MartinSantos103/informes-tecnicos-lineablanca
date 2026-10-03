import { z } from 'zod';
import { EQUIPMENT_TYPES } from '../types';

export const reportFormSchema = z.object({
  date: z.string().min(1, 'La fecha es obligatoria'),
  client_name: z.string().min(2, 'El nombre del cliente debe tener al menos 2 caracteres'),
  address: z.string().min(3, 'La dirección es obligatoria'),
  phone: z.string().min(6, 'El teléfono es obligatorio y debe ser válido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  brand: z.string().min(1, 'La marca es obligatoria'),
  model: z.string().min(1, 'El modelo es obligatorio'),
  equipment: z.string().min(1, 'Selecciona un tipo de equipo'),
  serial_number: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : '-')),
  diagnosis: z.string().min(5, 'El diagnóstico técnico debe detallar la falla (mín. 5 caracteres)'),
  cause: z.string().min(5, 'La causa del origen de la falla es obligatoria (mín. 5 caracteres)'),
  work_description: z.string().min(5, 'La descripción del trabajo debe ser detallada (mín. 5 caracteres)'),
  estimated_cost: z.coerce
    .number({ invalid_type_error: 'Debe ingresar un monto numérico' })
    .min(0, 'El costo estimado no puede ser negativo'),
});

export type ReportFormData = z.infer<typeof reportFormSchema>;

export const companySettingsSchema = z.object({
  name: z.string().min(2, 'El nombre de la empresa es obligatorio'),
  logo_url: z.string().optional().or(z.literal('')),
  address: z.string().min(3, 'La dirección es obligatoria'),
  phone: z.string().min(6, 'El teléfono es obligatorio'),
  email: z.string().email('Email inválido'),
  website: z.string().optional().or(z.literal('')),
  legal_notice: z.string().min(10, 'La nota legal debe tener al menos 10 caracteres'),
});

export type CompanyFormData = z.infer<typeof companySettingsSchema>;
