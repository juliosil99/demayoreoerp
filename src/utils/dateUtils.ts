
/**
 * Convierte una fecha a formato 'YYYY-MM-DD' respetando la zona horaria local
 * sin convertir a UTC (evita el desplazamiento de fecha)
 */
export function formatDateForQuery(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const result = `${year}-${month}-${day}`;
  
  return result;
}

/**
 * Convierte una fecha al inicio del día en la zona horaria local
 */
export function getLocalDateStart(date: Date): string {
  return formatDateForQuery(date);
}

/**
 * Convierte una fecha al final del día en la zona horaria local
 */
export function getLocalDateEnd(date: Date): string {
  return formatDateForQuery(date);
}

/**
 * Formatea una fecha string de la BD para mostrar en la UI
 * Maneja fechas sin conversión UTC para evitar cambios de día
 */
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return '';
  
  // Parse the date string as local date (without time zone conversion)
  const [year, month, day] = dateString.split('T')[0].split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Crea un objeto Date a partir de una fecha string de la BD sin conversión de zona horaria
 */
export function parseDateFromDB(dateString: string): Date {
  if (!dateString) return new Date();
  
  // Parse the date string as local date (without time zone conversion)
  const [year, month, day] = dateString.split('T')[0].split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}
