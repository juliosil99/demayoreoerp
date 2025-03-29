
export const formatCurrency = (amount: number | null) => {
  if (amount === null) return '-';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

export const formatDate = (date: string | null) => {
  if (!date) return '-';
  
  try {
    // Parse the date in UTC to avoid timezone shifts
    // This ensures the date shown is the same as the date stored
    const parsedDate = parseUTCDate(date);
    
    // Format with the browser's locale settings but preserve the UTC date
    return parsedDate.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC' // Crucial to prevent timezone shifts
    });
  } catch (error) {
    console.error("Error formatting date:", error, date);
    return '-';
  }
};

// Helper function to format dates specifically for cards and lists
export const formatCardDate = (dateString: string) => {
  try {
    if (!dateString) return "-";
    
    // Use the same UTC parsing approach for consistency
    const parsedDate = parseUTCDate(dateString);
    
    return parsedDate.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC' // Crucial to prevent timezone shifts
    });
  } catch (error) {
    console.error("Error formatting card date:", error, dateString);
    return dateString || '-';
  }
};

// Utility function to safely parse dates in UTC
function parseUTCDate(dateString: string): Date {
  // Handle ISO format dates (YYYY-MM-DDTHH:mm:ss.sssZ)
  if (dateString.includes('T')) {
    // Extract just the date part from ISO string
    dateString = dateString.split('T')[0];
  }
  
  // Split the date into parts and create a UTC date
  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JS Date
  const day = parseInt(parts[2], 10);
  
  // Create date explicitly with component parts in UTC
  return new Date(Date.UTC(year, month, day));
}
