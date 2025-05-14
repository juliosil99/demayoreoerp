

/**
 * Helper functions for XML element and attribute extraction
 */

// Helper function to get an element regardless of namespace prefix
export const getElementWithAnyNamespace = (node: Document | Element | null, localName: string): Element | null => {
  if (!node) return null;
  
  try {
    // First try with cfdi prefix (most common)
    let element: Element | null = null;
    
    // If it's a Document, use getElementsByTagName
    if (node.nodeType === Node.DOCUMENT_NODE) {
      const doc = node as Document;
      element = doc.getElementsByTagName(`cfdi:${localName}`)[0] as Element | undefined || null;
      
      // If not found, try without prefix
      if (!element) {
        element = doc.getElementsByTagName(localName)[0] as Element | undefined || null;
      }
      
      // If still not found, try with other common prefixes
      if (!element) {
        const commonPrefixes = ['', 'cfdi', 'cfd', 'tfd', 'nomina', 'pago'];
        for (const prefix of commonPrefixes) {
          const tagName = prefix ? `${prefix}:${localName}` : localName;
          element = doc.getElementsByTagName(tagName)[0] as Element | undefined || null;
          if (element) break;
        }
      }
    } 
    // If it's an Element, search within its children
    else if (node.nodeType === Node.ELEMENT_NODE) {
      const elem = node as Element;
      element = elem.getElementsByTagName(`cfdi:${localName}`)[0] as Element | undefined || null;
      
      // If not found, try without prefix
      if (!element) {
        element = elem.getElementsByTagName(localName)[0] as Element | undefined || null;
      }
      
      // If still not found, try with other common prefixes
      if (!element) {
        const commonPrefixes = ['', 'cfdi', 'cfd', 'tfd', 'nomina', 'pago'];
        for (const prefix of commonPrefixes) {
          const tagName = prefix ? `${prefix}:${localName}` : localName;
          element = elem.getElementsByTagName(tagName)[0] as Element | undefined || null;
          if (element) break;
        }
      }
    }
    
    return element;
  } catch (error) {
    console.error(`Error getting element ${localName}:`, error);
    return null;
  }
};

// Helper to safely get an attribute
export const getAttribute = (element: Element | null, name: string): string | null => {
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

// Validate ISO date format
export const isValidISODate = (dateString: string): boolean => {
  if (!dateString) return false;
  
  // Attempt to parse as ISO date
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  if (regex.test(dateString)) return true;
  
  // Check YYYY-MM-DD format
  const simpleRegex = /^\d{4}-\d{2}-\d{2}$/;
  return simpleRegex.test(dateString);
};

