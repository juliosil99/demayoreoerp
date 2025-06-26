
/**
 * Main CFDI XML parser that coordinates the parsing process using specialized modules
 */

import { CFDIParseResult } from '@/types/invoice-types';
import { getElementWithAnyNamespace, getAttribute } from './xml-parser/xml-helpers';
import { extractNamespaces, detectDocumentType } from './xml-parser/namespace-handler';
import { 
  extractInvoiceNumber, 
  extractInvoiceDate, 
  extractIssuerInfo, 
  extractReceiverInfo 
} from './xml-parser/field-extractors';
import { parseProductDetails, calculateTaxAmounts } from './xml-parser/product-tax-parser';
import { validateRequiredFields } from './xml-parser/validation';

export const parseXMLContent = (xmlContent: string): CFDIParseResult => {
  console.log("🔄 Starting XML parsing process");
  console.log(`📄 XML content length: ${xmlContent.length} characters`);
  
  try {
    // Parse the XML
    console.log("📋 Parsing XML document");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      console.error("❌ XML parser error found:", parserError.textContent);
      throw new Error(`XML parsing error: ${parserError.textContent}`);
    }
    
    console.log("✅ XML document parsed successfully");
    
    // Extract namespaces used in the document
    console.log("🔍 Extracting namespaces");
    const namespaces = extractNamespaces(xmlDoc);
    console.log("📋 Detected namespaces:", namespaces);
    
    // Determine document type
    console.log("🔍 Detecting document type");
    const documentType = detectDocumentType(xmlDoc, namespaces);
    console.log("📋 Detected document type:", documentType);
    
    // Get all the important elements using namespaces
    console.log("🔍 Extracting main XML elements");
    const comprobante = getElementWithAnyNamespace(xmlDoc, "Comprobante");
    const emisor = getElementWithAnyNamespace(xmlDoc, "Emisor");
    const receptor = getElementWithAnyNamespace(xmlDoc, "Receptor");
    const timbreFiscal = getElementWithAnyNamespace(xmlDoc, "TimbreFiscalDigital");
    const conceptos = getElementWithAnyNamespace(xmlDoc, "Conceptos");
    
    console.log("📋 Main elements found:", {
      comprobante: !!comprobante,
      emisor: !!emisor,
      receptor: !!receptor,
      timbreFiscal: !!timbreFiscal,
      conceptos: !!conceptos
    });
    
    if (!comprobante) {
      console.error("❌ Required 'Comprobante' element not found");
      throw new Error("Elemento 'Comprobante' requerido no encontrado en el XML");
    }
    
    // Extract the invoice number with fallbacks
    console.log("🔍 Extracting invoice number");
    const invoiceNumber = extractInvoiceNumber(comprobante, documentType);
    console.log("📋 Invoice number:", invoiceNumber);
    
    // Extract the invoice date with fallbacks
    console.log("🔍 Extracting invoice date");
    const invoiceDate = extractInvoiceDate(comprobante);
    console.log("📋 Invoice date:", invoiceDate);
    
    // Extract issuer information with fallbacks
    console.log("🔍 Extracting issuer information");
    const issuerInfo = extractIssuerInfo(emisor);
    console.log("📋 Issuer info:", issuerInfo);
    
    // Extract receiver information
    console.log("🔍 Extracting receiver information");
    const receiverInfo = extractReceiverInfo(receptor);
    console.log("📋 Receiver info:", receiverInfo);
    
    // Parse product details with better error handling
    console.log("🔍 Parsing product details");
    const products = parseProductDetails(conceptos);
    console.log(`📦 Found ${products?.length || 0} products`);
    
    // Calculate tax amounts with fallbacks for different structures
    console.log("🔍 Calculating tax amounts");
    const taxInfo = calculateTaxAmounts(xmlDoc, namespaces);
    console.log("📋 Tax info:", taxInfo);
    
    // Extract key financial data
    const totalAmount = parseFloat(getAttribute(comprobante, "Total") || "0");
    const subtotal = parseFloat(getAttribute(comprobante, "SubTotal") || "0");
    const uuid = getAttribute(timbreFiscal, "UUID");
    
    console.log("💰 Financial data extracted:", {
      totalAmount,
      subtotal,
      taxAmount: taxInfo.totalTaxAmount,
      uuid
    });
    
    // Construct the final result
    const result: CFDIParseResult = {
      uuid: uuid,
      serie: getAttribute(comprobante, "Serie"),
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      total_amount: totalAmount,
      currency: getAttribute(comprobante, "Moneda"),
      payment_method: getAttribute(comprobante, "MetodoPago"),
      payment_form: getAttribute(comprobante, "FormaPago"),
      subtotal: subtotal,
      exchange_rate: parseFloat(getAttribute(comprobante, "TipoCambio") || "1"),
      invoice_type: getAttribute(comprobante, "TipoDeComprobante"),
      version: getAttribute(comprobante, "Version"),
      issuer_rfc: issuerInfo.rfc,
      issuer_name: issuerInfo.name,
      issuer_tax_regime: issuerInfo.taxRegime,
      receiver_rfc: receiverInfo.rfc,
      receiver_name: receiverInfo.name,
      receiver_tax_regime: receiverInfo.taxRegime,
      receiver_cfdi_use: receiverInfo.cfdiUse,
      receiver_zip_code: receiverInfo.zipCode,
      certificate_number: getAttribute(comprobante, "NoCertificado"),
      stamp_date: getAttribute(timbreFiscal, "FechaTimbrado"),
      sat_certificate_number: getAttribute(timbreFiscal, "NoCertificadoSAT"),
      cfdi_stamp: getAttribute(timbreFiscal, "SelloCFD"),
      sat_stamp: getAttribute(timbreFiscal, "SelloSAT"),
      tax_amount: taxInfo.totalTaxAmount,
      products: products,
    };
    
    console.log("🔍 Running field validation");
    validateRequiredFields(result);
    
    console.log("✅ XML parsing completed successfully");
    console.log("📋 Final result summary:", {
      uuid: result.uuid,
      invoiceNumber: result.invoice_number,
      totalAmount: result.total_amount,
      productsCount: result.products?.length || 0
    });
    
    return result;
  } catch (error) {
    console.error("❌ Error parsing XML:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Provide minimal default structure with error information
    return {
      error: true,
      errorMessage: error instanceof Error ? error.message : "Error desconocido al procesar XML",
      uuid: null,
      serie: null,
      invoice_number: null,
      invoice_date: null,
      total_amount: 0,
      currency: null,
      payment_method: null,
      payment_form: null,
      subtotal: 0,
      exchange_rate: 1,
      invoice_type: null,
      version: null,
      issuer_rfc: null,
      issuer_name: null,
      issuer_tax_regime: null,
      receiver_rfc: null,
      receiver_name: null,
      receiver_tax_regime: null,
      receiver_cfdi_use: null,
      receiver_zip_code: null,
      certificate_number: null,
      stamp_date: null,
      sat_certificate_number: null,
      cfdi_stamp: null,
      sat_stamp: null,
      tax_amount: 0,
      products: [],
    };
  }
};
