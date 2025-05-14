
/**
 * Functions for handling XML namespaces
 */

import { getElementWithAnyNamespace, getAttribute } from './xml-helpers';

// Extract namespaces from the XML document
export const extractNamespaces = (xmlDoc: Document): Record<string, string> => {
  const namespaces: Record<string, string> = {};
  
  try {
    const rootElement = xmlDoc.documentElement;
    
    if (!rootElement) {
      return { cfdi: "http://www.sat.gob.mx/cfd/3", tfd: "http://www.sat.gob.mx/TimbreFiscalDigital" };
    }
    
    // Get all attributes of the root element
    const attributes = rootElement.attributes;
    
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      if (attr.name.startsWith('xmlns:')) {
        const prefix = attr.name.split(':')[1];
        namespaces[prefix] = attr.value;
      }
    }
    
    // Add default namespaces if not present
    if (!Object.keys(namespaces).includes('cfdi')) {
      if (rootElement.namespaceURI) {
        namespaces['cfdi'] = rootElement.namespaceURI;
      } else {
        // Default CFDI namespace
        namespaces['cfdi'] = "http://www.sat.gob.mx/cfd/3";
      }
    }
    
    if (!Object.keys(namespaces).includes('tfd')) {
      namespaces['tfd'] = "http://www.sat.gob.mx/TimbreFiscalDigital";
    }
    
  } catch (error) {
    console.error("Error extracting namespaces:", error);
    // Return default namespaces
    return { cfdi: "http://www.sat.gob.mx/cfd/3", tfd: "http://www.sat.gob.mx/TimbreFiscalDigital" };
  }
  
  return namespaces;
};

// Detect the type of CFDI document
export const detectDocumentType = (xmlDoc: Document, namespaces: Record<string, string>): string => {
  try {
    const comprobante = xmlDoc.documentElement;
    
    if (!comprobante) return 'unknown';
    
    // Get attributes and elements using imported helper functions
    const tipoComprobante = getAttribute(comprobante, "TipoDeComprobante");
    
    // Check for complementary nodes that indicate special document types
    const hasNominaNode = getElementWithAnyNamespace(xmlDoc, "Nomina") !== null;
    const hasPagoNode = getElementWithAnyNamespace(xmlDoc, "Pago") !== null;
    
    if (hasNominaNode) {
      return 'payroll';
    } else if (hasPagoNode) {
      return 'payment';
    } else if (tipoComprobante === 'I') {
      return 'invoice';
    } else if (tipoComprobante === 'E') {
      return 'credit-note';
    } else if (tipoComprobante === 'P') {
      return 'payment';
    } else if (tipoComprobante === 'N') {
      return 'payroll';
    } else if (tipoComprobante === 'T') {
      return 'transfer';
    }
    
    // Default to standard invoice if we can't determine type
    return 'invoice';
  } catch (error) {
    console.error("Error detecting document type:", error);
    return 'invoice'; // Default
  }
};
