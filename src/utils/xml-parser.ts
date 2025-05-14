
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
  try {
    console.log("Starting XML parsing process");
    
    // Parse the XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    
    // Extract namespaces used in the document
    const namespaces = extractNamespaces(xmlDoc);
    console.log("Detected namespaces:", namespaces);
    
    // Determine document type
    const documentType = detectDocumentType(xmlDoc, namespaces);
    console.log("Detected document type:", documentType);
    
    // Get all the important elements using namespaces
    const comprobante = getElementWithAnyNamespace(xmlDoc, "Comprobante");
    const emisor = getElementWithAnyNamespace(xmlDoc, "Emisor");
    const receptor = getElementWithAnyNamespace(xmlDoc, "Receptor");
    const timbreFiscal = getElementWithAnyNamespace(xmlDoc, "TimbreFiscalDigital");
    const conceptos = getElementWithAnyNamespace(xmlDoc, "Conceptos");
    
    // Extract the invoice number with fallbacks
    const invoiceNumber = extractInvoiceNumber(comprobante, documentType);
    
    // Extract the invoice date with fallbacks
    const invoiceDate = extractInvoiceDate(comprobante);
    
    // Extract issuer information with fallbacks
    const issuerInfo = extractIssuerInfo(emisor);
    
    // Extract receiver information
    const receiverInfo = extractReceiverInfo(receptor);
    
    // Parse product details with better error handling
    const products = parseProductDetails(conceptos);
    
    // Calculate tax amounts with fallbacks for different structures
    const taxInfo = calculateTaxAmounts(xmlDoc, namespaces);
    
    // Construct the final result
    const result: CFDIParseResult = {
      uuid: getAttribute(timbreFiscal, "UUID"),
      serie: getAttribute(comprobante, "Serie"),
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      total_amount: parseFloat(getAttribute(comprobante, "Total") || "0"),
      currency: getAttribute(comprobante, "Moneda"),
      payment_method: getAttribute(comprobante, "MetodoPago"),
      payment_form: getAttribute(comprobante, "FormaPago"),
      subtotal: parseFloat(getAttribute(comprobante, "SubTotal") || "0"),
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
    
    validateRequiredFields(result);
    console.log("XML parsing completed successfully");
    return result;
  } catch (error) {
    console.error("Error parsing XML:", error);
    // Provide minimal default structure with error information
    return {
      error: true,
      errorMessage: error instanceof Error ? error.message : "Unknown XML parsing error",
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
