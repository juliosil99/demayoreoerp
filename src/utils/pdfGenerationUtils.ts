
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
