

import { ProductSearchResult } from "@/types/product-search";

interface PdfStatus {
  possible: boolean;
  reason?: string;
}

interface FieldsStatus {
  complete: boolean;
  missingFields: string[];
}

/**
 * Hook to validate if PDF generation is possible for a product
 * and determine the status of required fields
 */
export const usePdfValidation = (product: ProductSearchResult) => {
  /**
   * Determines if PDF generation is possible based on basic requirements
   */
  const isPdfGenerationPossible = (product: ProductSearchResult): PdfStatus => {
    if (!product) {
      return { 
        possible: false, 
        reason: "Producto no válido" 
      };
    }

    // Check for invoice ID
    if (!product.invoice_id) {
      return { 
        possible: false, 
        reason: "No hay factura asociada a este producto" 
      };
    }
    
    // Check for issuer RFC (required to potentially fetch template)
    if (!product.invoice?.issuer_rfc) {
      return { 
        possible: false, 
        reason: "Falta RFC del emisor en la factura" 
      };
    }
    
    return { possible: true };
  };

  /**
   * Checks for missing critical fields to determine if PDF will be complete
   */
  const hasCriticalFields = (product: ProductSearchResult): FieldsStatus => {
    if (!product || !product.invoice) {
      return { 
        complete: false, 
        missingFields: ["datos de factura"] 
      };
    }
    
    const missingFields: string[] = [];
    
    // Check for identification fields - now safely using uuid property
    if (!product.invoice.invoice_number && !product.invoice.serie && !product.invoice.uuid) {
      missingFields.push("identificadores de factura");
    }
    
    // Check for date information
    if (!product.invoice.invoice_date && !product.invoice.stamp_date) {
      missingFields.push("fecha");
    }
    
    // Check for party information
    if (!product.invoice.issuer_name) {
      missingFields.push("emisor");
    }
    
    if (!product.invoice.receiver_name) {
      missingFields.push("receptor");
    }
    
    return { 
      complete: missingFields.length === 0,
      missingFields
    };
  };

  return {
    pdfStatus: isPdfGenerationPossible(product),
    fieldsStatus: hasCriticalFields(product)
  };
};

