
/**
 * Helper functions for XML element and attribute extraction
 */

// Helper function to get an element regardless of namespace prefix
export const getElementWithAnyNamespace = (xmlDoc: Document | null, localName: string): Element | null => {
  if (!xmlDoc) return null;
  
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
