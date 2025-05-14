
/**
 * Functions for validating and providing fallbacks for required fields
 */

// Validate required fields and provide fallbacks
export const validateRequiredFields = (result: any) => {
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
