
import { toast } from "@/components/ui/use-toast";
import { createPdfFilename } from "@/utils/pdfGenerationUtils";
import { fetchInvoiceData, fetchInvoiceProducts, fetchTemplateConfig, fetchIssuerContactData, fetchReceiverCompanyData, fetchReceiverContactData } from "./invoice-pdf/databaseService";
import { generateSATCompliantPdf } from "./invoice-pdf/pdfGenerator";
import type { PdfGenerationResult } from "./invoice-pdf/types";

/**
 * Main function to generate a SAT-compliant PDF for an invoice
 */
export const generateInvoicePdf = async (
  invoiceId: number,
  issuerRfc: string
): Promise<PdfGenerationResult> => {
  try {
    console.log(`Starting SAT-compliant PDF generation for invoice ID: ${invoiceId}, RFC: ${issuerRfc}`);

    // Input validation
    if (!invoiceId) {
      return {
        success: false,
        error: "Se requiere un ID de factura válido para generar el PDF"
      };
    }

    // 1. Get invoice data
    const invoice = await fetchInvoiceData(invoiceId);
    if (!invoice) {
      return {
        success: false,
        error: "No se pudo encontrar la factura en la base de datos"
      };
    }

    // 2. Get invoice products
    const products = await fetchInvoiceProducts(invoiceId);

    // 3. Try to get PDF template configuration
    const templateConfig = await fetchTemplateConfig(issuerRfc);
    
    // 3.5 Fetch issuer's contact data for more details
    const issuerDetails = await fetchIssuerContactData(invoice.issuer_rfc || issuerRfc);

    // 3.6 Fetch receiver details from companies or contacts
    let receiverDetails = await fetchReceiverCompanyData(invoice.receiver_rfc || '');
    if (!receiverDetails) {
      console.log("Receiver not found in companies, checking contacts...");
      receiverDetails = await fetchReceiverContactData(invoice.receiver_rfc || '');
    }

    // 4. Generate SAT-compliant PDF
    const doc = await generateSATCompliantPdf(invoice, products, templateConfig, issuerDetails, receiverDetails);
    
    // 5. Save the file
    const filename = createPdfFilename(
      invoice.invoice_number,
      invoice.serie,
      invoice.uuid,
      invoice.issuer_name,
      invoiceId
    );
    
    doc.save(filename);
    console.log("SAT-compliant PDF saved successfully with filename:", filename);
    
    return { 
      success: true,
      filename 
    };
  } catch (err) {
    console.error("Unexpected error in SAT PDF generation:", err);
    return {
      success: false,
      error: err instanceof Error 
        ? `Error al generar PDF: ${err.message}` 
        : "Error desconocido al generar el PDF",
    };
  }
};
