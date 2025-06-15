
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
