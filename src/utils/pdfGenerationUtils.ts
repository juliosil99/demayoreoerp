import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "@/components/ui/use-toast";

/**
 * Formats a number as currency in MXN format
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};

/**
 * Creates a robust filename for PDF downloads with proper fallback handling
 */
export const createPdfFilename = (
  invoiceNumber?: string | null,
  serie?: string | null, 
  uuid?: string | null, 
  issuerName?: string | null,
  id?: number | string
): string => {
  if (invoiceNumber && serie) {
    return `Factura-${serie}-${invoiceNumber}.pdf`;
  } else if (invoiceNumber) {
    return `Factura-${invoiceNumber}.pdf`;
  } else if (uuid) {
    return `Factura-UUID-${uuid.substring(0, 8)}.pdf`;
  } else if (issuerName) {
    const sanitizedName = issuerName.replace(/\s+/g, '-').substring(0, 20);
    return `Factura-${sanitizedName}-${id || 'unknown'}.pdf`;
  } else {
    return `Factura-ID-${id || new Date().getTime()}.pdf`;
  }
};

/**
 * Creates a text with fallback for invoice identification
 */
export const getInvoiceIdentifier = (
  serie?: string | null,
  invoiceNumber?: string | null,
  uuid?: string | null
): string => {
  if (serie && invoiceNumber) {
    return `${serie} ${invoiceNumber}`;
  } else if (serie) {
    return `${serie} (Sin número)`;
  } else if (invoiceNumber) {
    return invoiceNumber;
  } else if (uuid) {
    return `UUID: ${uuid.substring(0, 8)}...`;
  } else {
    return "No disponible";
  }
};

/**
 * Creates a date string with fallback options
 */
export const getFormattedDate = (
  invoiceDate?: string | null,
  stampDate?: string | null
): string => {
  try {
    if (invoiceDate) {
      return new Date(invoiceDate).toLocaleDateString();
    } else if (stampDate) {
      return new Date(stampDate).toLocaleDateString() + " (Fecha timbrado)";
    }
    return "No disponible";
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Error en formato de fecha";
  }
};

/**
 * Safety wrapper for adding text to PDF
 */
export const safeAddText = (
  doc: jsPDF,
  text: string | null | undefined,
  x: number,
  y: number,
  options?: any
): void => {
  try {
    const safeText = text || "No disponible";
    doc.text(safeText, x, y, options);
  } catch (error) {
    console.error(`Error adding text "${text}" at position (${x},${y}):`, error);
    doc.text("Error al mostrar texto", x, y, options);
  }
};

/**
 * Formats RFC with proper validation and display
 */
export const formatRFC = (rfc?: string | null): string => {
  if (!rfc) return "No disponible";
  return rfc.toUpperCase().trim();
};

/**
 * Formats invoice type for SAT compliance
 */
export const formatComprobanteFiscal = (invoiceType?: string | null): string => {
  const types: Record<string, string> = {
    'I': 'Ingreso',
    'E': 'Egreso', 
    'T': 'Traslado',
    'N': 'Nómina',
    'P': 'Pago'
  };
  
  return types[invoiceType || ''] || invoiceType || 'No especificado';
};

/**
 * Validates required fields for SAT compliance
 */
export const validateSATRequiredFields = (invoice: any): { isValid: boolean; missingFields: string[] } => {
  const requiredFields = [
    { field: 'uuid', name: 'UUID' },
    { field: 'issuer_rfc', name: 'RFC Emisor' },
    { field: 'receiver_rfc', name: 'RFC Receptor' },
    { field: 'total_amount', name: 'Monto Total' },
    { field: 'invoice_date', name: 'Fecha de Factura' }
  ];
  
  const missingFields: string[] = [];
  
  requiredFields.forEach(({ field, name }) => {
    if (!invoice[field]) {
      missingFields.push(name);
    }
  });
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Formats tax regime for display
 */
export const formatTaxRegime = (regime?: string | null): string => {
  if (!regime) return "No especificado";
  
  const regimes: Record<string, string> = {
    '601': 'General de Ley Personas Morales',
    '603': 'Personas Morales con Fines no Lucrativos',
    '605': 'Sueldos y Salarios e Ingresos Asimilados a Salarios',
    '606': 'Arrendamiento',
    '607': 'Régimen de Enajenación o Adquisición de Bienes',
    '608': 'Demás ingresos',
    '610': 'Residentes en el Extranjero sin Establecimiento Permanente en México',
    '611': 'Ingresos por Dividendos (socios y accionistas)',
    '612': 'Personas Físicas con Actividades Empresariales y Profesionales',
    '614': 'Ingresos por intereses',
    '615': 'Régimen de los ingresos por obtención de premios',
    '616': 'Sin obligaciones fiscales',
    '620': 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos',
    '621': 'Incorporación Fiscal',
    '622': 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras',
    '623': 'Opcional para Grupos de Sociedades',
    '624': 'Coordinados',
    '625': 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
    '626': 'Régimen Simplificado de Confianza'
  };
  
  return regimes[regime] || regime;
};
