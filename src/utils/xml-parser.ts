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

// Extract namespaces from the XML document
const extractNamespaces = (xmlDoc: Document): Record<string, string> => {
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
const detectDocumentType = (xmlDoc: Document, namespaces: Record<string, string>): string => {
  try {
    const comprobante = xmlDoc.documentElement;
    
    if (!comprobante) return 'unknown';
    
    // Check for tipo de comprobante attribute
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

// Helper function to get an element regardless of namespace prefix
const getElementWithAnyNamespace = (xmlDoc: Document, localName: string): Element | null => {
  try {
    // First try with cfdi prefix (most common)
    let element = xmlDoc.getElementsByTagName(`cfdi:${localName}`)[0];
    
    // If not found, try without prefix
    if (!element) {
      element = xmlDoc.getElementsByTagName(localName)[0];
    }
    
    // If still not found, try with other common prefixes
    if (!element) {
      const commonPrefixes = ['', 'cfdi', 'cfd', 'tfd', 'nomina', 'pago'];
      for (const prefix of commonPrefixes) {
        const tagName = prefix ? `${prefix}:${localName}` : localName;
        element = xmlDoc.getElementsByTagName(tagName)[0];
        if (element) break;
      }
    }
    
    return element || null;
  } catch (error) {
    console.error(`Error getting element ${localName}:`, error);
    return null;
  }
};

// Helper to safely get an attribute
const getAttribute = (element: Element | null, name: string): string | null => {
  if (!element) return null;
  
  try {
    // Try direct attribute access
    if (element.hasAttribute(name)) {
      return element.getAttribute(name);
    }
    
    // If not found, check children for this attribute in case of nested structure
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.hasAttribute(name)) {
        return child.getAttribute(name);
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting attribute ${name}:`, error);
    return null;
  }
};

// Extract invoice number with fallbacks for different document types
const extractInvoiceNumber = (comprobante: Element | null, documentType: string): string | null => {
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
const extractInvoiceDate = (comprobante: Element | null): string | null => {
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
      const timbreFiscal = getElementWithAnyNamespace(comprobante.ownerDocument, "TimbreFiscalDigital");
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

// Validate ISO date format
const isValidISODate = (dateString: string): boolean => {
  if (!dateString) return false;
  
  // Attempt to parse as ISO date
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  if (regex.test(dateString)) return true;
  
  // Check YYYY-MM-DD format
  const simpleRegex = /^\d{4}-\d{2}-\d{2}$/;
  return simpleRegex.test(dateString);
};

// Extract issuer information with fallbacks
const extractIssuerInfo = (emisor: Element | null) => {
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
const extractReceiverInfo = (receptor: Element | null) => {
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
      const domicilioFiscal = getElementWithAnyNamespace(receptor.ownerDocument, "DomicilioFiscal");
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

// Parse product details with better error handling
const parseProductDetails = (conceptos: Element | null) => {
  if (!conceptos) return [];
  
  try {
    const conceptoElements = conceptos.getElementsByTagName("cfdi:Concepto");
    
    // If no concepts found with cfdi prefix, try without prefix
    const elements = conceptoElements.length > 0 ? 
                    conceptoElements : 
                    conceptos.getElementsByTagName("Concepto");
    
    return Array.from(elements).map(concepto => {
      try {
        return {
          description: getAttribute(concepto, "Descripcion"),
          quantity: parseFloat(getAttribute(concepto, "Cantidad") || "0"),
          unit: getAttribute(concepto, "Unidad"),
          unitValue: parseFloat(getAttribute(concepto, "ValorUnitario") || "0"),
          amount: parseFloat(getAttribute(concepto, "Importe") || "0"),
          productKey: getAttribute(concepto, "ClaveProdServ"),
          unitKey: getAttribute(concepto, "ClaveUnidad"),
        };
      } catch (error) {
        console.error("Error parsing concepto:", error);
        // Return minimal valid object for this product
        return {
          description: "Error parsing product",
          quantity: 0,
          unit: null,
          unitValue: 0,
          amount: 0,
          productKey: null,
          unitKey: null,
        };
      }
    });
  } catch (error) {
    console.error("Error parsing products:", error);
    return [];
  }
};

// Calculate tax amounts with support for different structures
const calculateTaxAmounts = (xmlDoc: Document, namespaces: Record<string, string>) => {
  let totalTaxAmount = 0;
  
  try {
    // Try to get impuestos at document level first (most common)
    const impuestosElements = xmlDoc.getElementsByTagName("cfdi:Impuestos");
    
    if (impuestosElements.length > 0) {
      for (let i = 0; i < impuestosElements.length; i++) {
        const impuestos = impuestosElements[i];
        
        // Try to get direct Traslados/Traslado structure
        let traslados = impuestos.getElementsByTagName("cfdi:Traslados")[0];
        if (traslados) {
          const trasladoElements = traslados.getElementsByTagName("cfdi:Traslado");
          Array.from(trasladoElements).forEach(traslado => {
            totalTaxAmount += parseFloat(getAttribute(traslado, "Importe") || "0");
          });
        } else {
          // Direct Traslado children sometimes exist without Traslados parent
          const directTrasladoElements = impuestos.getElementsByTagName("cfdi:Traslado");
          Array.from(directTrasladoElements).forEach(traslado => {
            totalTaxAmount += parseFloat(getAttribute(traslado, "Importe") || "0");
          });
        }
      }
    } else {
      // Try without cfdi prefix
      const impuestosWithoutPrefix = xmlDoc.getElementsByTagName("Impuestos");
      if (impuestosWithoutPrefix.length > 0) {
        for (let i = 0; i < impuestosWithoutPrefix.length; i++) {
          const impuestos = impuestosWithoutPrefix[i];
          
          // Try with and without prefix
          const trasladosElements = impuestos.getElementsByTagName("Traslados")[0] || 
                                   impuestos.getElementsByTagName("traslados")[0];
          
          if (trasladosElements) {
            const trasladoElements = trasladosElements.getElementsByTagName("Traslado") || 
                                    trasladosElements.getElementsByTagName("traslado");
                                    
            Array.from(trasladoElements).forEach(traslado => {
              totalTaxAmount += parseFloat(getAttribute(traslado, "Importe") || "0");
            });
          } else {
            // Try direct traslado children
            const directTrasladoElements = impuestos.getElementsByTagName("Traslado") || 
                                          impuestos.getElementsByTagName("traslado");
                                          
            Array.from(directTrasladoElements).forEach(traslado => {
              totalTaxAmount += parseFloat(getAttribute(traslado, "Importe") || "0");
            });
          }
        }
      } else {
        // If no impuestos found, try TotalImpuestosTrasladados attribute on Comprobante
        const comprobante = xmlDoc.documentElement;
        if (comprobante) {
          const totalImpuestos = getAttribute(comprobante, "TotalImpuestosTrasladados");
          if (totalImpuestos) {
            totalTaxAmount = parseFloat(totalImpuestos);
          }
        }
      }
    }
    
    return { totalTaxAmount };
  } catch (error) {
    console.error("Error calculating tax amounts:", error);
    return { totalTaxAmount: 0 };
  }
};

// Validate required fields and provide fallbacks
const validateRequiredFields = (result: any) => {
  // Required fields validation
  if (!result.invoice_number) {
    console.warn("Missing invoice number, using fallback");
    // Use UUID prefix or timestamp as fallback
    result.invoice_number = result.uuid ? 
                           result.uuid.substring(0, 8) : 
                           `INV-${Date.now()}`;
  }
  
  if (!result.invoice_date) {
    console.warn("Missing invoice date, using fallback");
    // Use stamp_date or current date
    result.invoice_date = result.stamp_date || new Date().toISOString();
  }
  
  if (!result.issuer_name) {
    console.warn("Missing issuer name, using fallback");
    // Use RFC as fallback for name
    result.issuer_name = result.issuer_rfc || "Unknown Issuer";
  }
  
  return result;
};
