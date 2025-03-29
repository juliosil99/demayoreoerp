
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
    // Create date in UTC to avoid timezone issues
    const parts = date.split('T')[0].split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JS Date
    const day = parseInt(parts[2], 10);
    
    // Create date explicitly with component parts to avoid timezone shifts
    const parsedDate = new Date(Date.UTC(year, month, day));
    
    return parsedDate.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC' // Important to prevent timezone shifts
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
    
    // Create date in UTC to avoid timezone issues
    const parts = dateString.split('T')[0].split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JS Date
    const day = parseInt(parts[2], 10);
    
    // Create date explicitly with component parts to avoid timezone shifts
    const parsedDate = new Date(Date.UTC(year, month, day));
    
    return parsedDate.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC' // Important to prevent timezone shifts
    });
  } catch (error) {
    console.error("Error formatting date:", error, dateString);
    return dateString || '-';
  }
};
