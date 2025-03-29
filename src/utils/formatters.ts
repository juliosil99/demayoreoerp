
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
    // Parse the date directly as ISO format to avoid timezone issues
    const parsedDate = new Date(date);
    
    // Use toLocaleDateString to format the date
    return parsedDate.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
    
    // Parse the ISO date string directly to avoid timezone shifts
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", error, dateString);
    return dateString || '-';
  }
};
