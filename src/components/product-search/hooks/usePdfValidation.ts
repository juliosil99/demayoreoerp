
import { ProductSearchResult } from "@/types/product-search";

interface PdfStatus {
  possible: boolean;
  reason?: string;
}

interface FieldsStatus {
  complete: boolean;
  missingFields: string[];
}

export const usePdfValidation = (product: ProductSearchResult) => {
  // This function determines if PDF generation is possible for a product
  const isPdfGenerationPossible = (product: ProductSearchResult): PdfStatus => {
    // Basic check for invoice ID and issuer RFC
    if (!product.invoice_id || !product.invoice?.issuer_rfc) {
      return { possible: false, reason: "Faltan datos de factura: ID o RFC del emisor" };
    }
    
    return { possible: true };
  };

  // We check missing critical fields to determine if PDF will be complete
  const hasCriticalFields = (product: ProductSearchResult): FieldsStatus => {
    if (!product.invoice) return { complete: false, missingFields: ["datos de factura"] };
    
    const missingFields = [];
    
    if (!product.invoice.invoice_number && !product.invoice.serie) {
      missingFields.push("número o serie de factura");
    }
    
    if (!product.invoice.invoice_date && !product.invoice.stamp_date) {
      missingFields.push("fecha");
    }
    
    if (!product.invoice.issuer_name) {
      missingFields.push("emisor");
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
