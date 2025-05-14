

/**
 * Functions for extracting specific fields from CFDI XML documents
 */

import { getElementWithAnyNamespace, getAttribute, isValidISODate } from './xml-helpers';

// Extract invoice number with fallbacks for different document types
export const extractInvoiceNumber = (comprobante: Element | null, documentType: string): string | null => {
  if (!comprobante) return null;
  
  try {
    // Try standard Folio attribute first
    let invoiceNumber = getAttribute(comprobante, "Folio");
    
    // If not found, check for NumeroFolio (used in some variation)
    if (!invoiceNumber) {
      invoiceNumber = getAttribute(comprobante, "NumeroFolio");
    }
    
    // If still not found, check for folioFiscal in some custom fields
    if (!invoiceNumber) {
      // Try with complemento fields
      const ownerDoc = comprobante.ownerDocument;
      if (ownerDoc) {
        const complemento = getElementWithAnyNamespace(ownerDoc, "Complemento");
        if (complemento) {
          invoiceNumber = getAttribute(complemento, "FolioFiscal");
        }
      }
    }
    
    // If not found and this is a payment or payroll doc, try other relevant elements
    if (!invoiceNumber && (documentType === 'payment' || documentType === 'payroll')) {
      const ownerDoc = comprobante.ownerDocument;
      if (!ownerDoc) return null;
      
      // For payment docs, try to use NumOperacion or some other identifier
      const pagos = getElementWithAnyNamespace(ownerDoc, "Pagos");
      if (pagos) {
        const pago = getElementWithAnyNamespace(pagos, "Pago");
        if (pago) {
          invoiceNumber = getAttribute(pago, "NumOperacion") || getAttribute(pago, "NumDocumento");
        }
      }
      
      // For payroll, use some other identifier if available
      if (!invoiceNumber && documentType === 'payroll') {
        const nomina = getElementWithAnyNamespace(ownerDoc, "Nomina");
        if (nomina) {
          invoiceNumber = getAttribute(nomina, "NumEmpleado") || getAttribute(nomina, "NumeroRecibo");
        }
      }
    }
    
    // Last resort: Use UUID prefix or Serie + counter if Serie exists
    if (!invoiceNumber) {
      const ownerDoc = comprobante.ownerDocument;
      if (!ownerDoc) return null;
      
      const timbreFiscal = getElementWithAnyNamespace(ownerDoc, "TimbreFiscalDigital");
      const uuid = getAttribute(timbreFiscal, "UUID");
      const serie = getAttribute(comprobante, "Serie");
      
      if (uuid) {
        invoiceNumber = uuid.substring(0, 8); // Use first part of UUID
      } else if (serie) {
        // Create a placeholder number using Serie and date to make it unique
        const fechaComprobante = getAttribute(comprobante, "Fecha") || "";
        const datePart = fechaComprobante.replace(/[-:T]/g, "").substring(0, 8);
        invoiceNumber = `${serie}-${datePart}`;
      }
    }
    
    return invoiceNumber;
  } catch (error) {
    console.error("Error extracting invoice number:", error);
    return null;
  }
};

// Extract invoice date with fallbacks
export const extractInvoiceDate = (comprobante: Element | null): string | null => {
  if (!comprobante) return null;
  
  try {
    // Try standard Fecha attribute
    let invoiceDate = getAttribute(comprobante, "Fecha");
    
    // If not found, try FechaExpedicion
    if (!invoiceDate) {
      invoiceDate = getAttribute(comprobante, "FechaExpedicion");
    }
    
    // If still not found, check for FechaTimbrado in TimbreFiscalDigital
    if (!invoiceDate) {
      const ownerDoc = comprobante.ownerDocument;
      if (!ownerDoc) return null;
      const timbreFiscal = getElementWithAnyNamespace(ownerDoc, "TimbreFiscalDigital");
      if (timbreFiscal) {
        invoiceDate = getAttribute(timbreFiscal, "FechaTimbrado");
      }
    }
    
    // Check if date is in valid format
    if (invoiceDate && !isValidISODate(invoiceDate)) {
      console.warn("Invalid date format:", invoiceDate);
      
      // Try to convert to ISO format if possible
      const parsedDate = new Date(invoiceDate);
      if (!isNaN(parsedDate.getTime())) {
        invoiceDate = parsedDate.toISOString();
      } else {
        // Use current date as fallback if parsing failed
        console.warn("Using current date as fallback for invalid date");
        invoiceDate = new Date().toISOString();
      }
    }
    
    return invoiceDate;
  } catch (error) {
    console.error("Error extracting invoice date:", error);
    return null;
  }
};

// Extract issuer information with fallbacks
export const extractIssuerInfo = (emisor: Element | null) => {
  const defaultInfo = { rfc: null, name: null, taxRegime: null };
  
  if (!emisor) return defaultInfo;
  
  try {
    const rfc = getAttribute(emisor, "Rfc");
    const name = getAttribute(emisor, "Nombre");
    const taxRegime = getAttribute(emisor, "RegimenFiscal");
    
    return {
      rfc: rfc,
      name: name,
      taxRegime: taxRegime
    };
  } catch (error) {
    console.error("Error extracting issuer info:", error);
    return defaultInfo;
  }
};

// Extract receiver information with fallbacks
export const extractReceiverInfo = (receptor: Element | null) => {
  const defaultInfo = { rfc: null, name: null, taxRegime: null, cfdiUse: null, zipCode: null };
  
  if (!receptor) return defaultInfo;
  
  try {
    const rfc = getAttribute(receptor, "Rfc");
    const name = getAttribute(receptor, "Nombre");
    
    // Try standard CFDI 4.0 attributes first
    let taxRegime = getAttribute(receptor, "RegimenFiscalReceptor");
    let cfdiUse = getAttribute(receptor, "UsoCFDI");
    let zipCode = getAttribute(receptor, "DomicilioFiscalReceptor");
    
    // Check for CFDI 3.3 structure if not found
    if (!taxRegime) {
      // In 3.3, there might be separate nodes for this info
      const ownerDoc = receptor.ownerDocument;
      if (!ownerDoc) return defaultInfo;
      const domicilioFiscal = getElementWithAnyNamespace(ownerDoc, "DomicilioFiscal");
      if (domicilioFiscal) {
        zipCode = getAttribute(domicilioFiscal, "CodigoPostal");
      }
    }
    
    return {
      rfc: rfc,
      name: name,
      taxRegime: taxRegime,
      cfdiUse: cfdiUse,
      zipCode: zipCode
    };
  } catch (error) {
    console.error("Error extracting receiver info:", error);
    return defaultInfo;
  }
};

