
/**
 * Functions for parsing product details and tax information from CFDI XML
 */

import { getElementWithAnyNamespace, getAttribute } from './xml-helpers';

// Parse product details with better error handling
export const parseProductDetails = (conceptos: Element | null) => {
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
export const calculateTaxAmounts = (xmlDoc: Document, namespaces: Record<string, string>) => {
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
