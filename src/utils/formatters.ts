import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatCurrency = (amount: number, currency: string = 'MXN'): string => {
  const currencySymbols: Record<string, string> = {
    'MXN': '$',
    'USD': '$',
    'EUR': '€',
  };

  const symbol = currencySymbols[currency] || '$';
  
  return `${symbol}${amount.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Parses a date string (e.g., 'YYYY-MM-DD') as a local date to avoid timezone shifts.
 * `new Date('2025-06-15')` would create a date at UTC midnight, which can cause day-off errors.
 * This helper creates a date at local midnight using `date-fns/parse`.
 */
const parseDateAsLocal = (date: string | Date): Date => {
  if (typeof date === 'string') {
    // Handles 'YYYY-MM-DD' and ISO strings like '2023-11-20T00:00:00+00:00'
    const dateString = date.split('T')[0];
    return parse(dateString, 'yyyy-MM-dd', new Date());
  }
  return date;
};

export const formatDate = (date: string | Date): string => {
  try {
    const dateObj = parseDateAsLocal(date);
    if (isNaN(dateObj.getTime())) throw new Error("Invalid date passed to formatDate");
    return format(dateObj, 'd MMM yyyy', { locale: es });
  } catch (error) {
    console.error("Error in formatDate:", error);
    return "Fecha inválida";
  }
};

export const formatCardDate = (date: string | Date): string => {
  try {
    const dateObj = parseDateAsLocal(date);
    if (isNaN(dateObj.getTime())) throw new Error("Invalid date passed to formatCardDate");
    return format(dateObj, 'dd/MM/yyyy');
  } catch (error) {
    console.error("Error in formatCardDate:", error);
    return "Fecha inválida";
  }
};

export const formatDatetime = (date: string | Date): string => {
  try {
    let dateObj: Date;

    if (typeof date === 'string') {
      // If it's a date-only string (YYYY-MM-DD), parse it as local to prevent timezone shifts.
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        dateObj = parse(date, 'yyyy-MM-dd', new Date());
      } else {
        // For full ISO strings, `new Date()` correctly interprets the timezone.
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }

    if (isNaN(dateObj.getTime())) throw new Error("Invalid date passed to formatDatetime");

    return format(dateObj, 'd MMM yyyy, HH:mm', { locale: es });
  } catch (error) {
    console.error("Error in formatDatetime:", error);
    return "Fecha inválida";
  }
};

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
