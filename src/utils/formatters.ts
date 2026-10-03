/**
 * Formatea un monto numérico a moneda local (ARS / USD).
 */
export const formatCurrency = (amount: number, currency: string = 'ARS'): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formatea una fecha YYYY-MM-DD a formato legible en español.
 */
export const formatDateSpanish = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

/**
 * Formatea un número de teléfono limpiando caracteres especiales para WhatsApp.
 */
export const cleanPhoneForWhatsApp = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '');
};

/**
 * Formatea un número de reporte a 6 dígitos con ceros iniciales (e.g. 000042)
 */
export const formatReportNumber = (num: number | string): string => {
  const strVal = String(num).replace(/[^0-9]/g, '');
  return strVal.padStart(6, '0');
};
