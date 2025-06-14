import { format, parse } from "date-fns";

/**
 * Convert Excel's numeric date to a proper JS Date
 * Excel dates are stored as days since 1900-01-01 (with a couple of quirks)
 */
export function excelDateToJSDate(excelDate: number): Date {
  // Excel's date system starts on January 1, 1900
  // Excel has a leap year bug where it thinks 1900 is a leap year
  // We need to create the correct base date for January 1, 1900
  const baseDate = new Date(Date.UTC(1900, 0, 1)); // January 1, 1900 in UTC
  
  // Excel incorrectly treats 1900 as a leap year, adding a non-existent Feb 29
  // For dates after February 28, 1900 (day 59 in Excel), we need to subtract a day
  const adjustedExcelDate = excelDate > 60 ? excelDate - 1 : excelDate;
  
  // Excel dates are 1-based (day 1 is January 1, 1900)
  // But JavaScript dates are 0-based from the baseDate
  // So we subtract 1 from the Excel date value
  const daysSinceBaseDate = adjustedExcelDate - 1;
  
  // Add the number of days to the base date
  const resultDate = new Date(baseDate);
  resultDate.setUTCDate(baseDate.getUTCDate() + daysSinceBaseDate);
  
  return resultDate;
}

/**
 * Format a date value from various possible formats to a standardized string 'yyyy-MM-dd'
 * This function is now timezone-safe and handles strings, numbers (Excel), and Date objects.
 */
export function formatDateValue(dateValue: any): string {
  // Handle Excel numeric dates
  if (typeof dateValue === 'number') {
    try {
      const jsDate = excelDateToJSDate(dateValue);
      return format(jsDate, 'yyyy-MM-dd');
    } catch (e) {
      console.error("Error parsing excel date:", e, dateValue);
      // Fall through to default
    }
  } 
  
  // Handle string date formats
  if (typeof dateValue === 'string' && dateValue.trim()) {
    try {
      // Parse the date part of the string as a local date
      const dateString = dateValue.split('T')[0];
      const localDate = parse(dateString, 'yyyy-MM-dd', new Date());
      if (isNaN(localDate.getTime())) throw new Error("Invalid date string");
      return format(localDate, 'yyyy-MM-dd');
    } catch (e) {
      console.error("Error parsing string date:", e, dateValue);
      // Fall through to default
    }
  }

  // Handle Date objects
  if (dateValue instanceof Date) {
    try {
      return format(dateValue, 'yyyy-MM-dd');
    } catch (e) {
      console.error("Error formatting date object:", e, dateValue);
      // Fall through to default
    }
  }
  
  // Fallback for null, undefined, empty string, or failed parsing
  return format(new Date(), 'yyyy-MM-dd');
}
