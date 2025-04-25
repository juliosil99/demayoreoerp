
/**
 * Validation rules and functions for sales data
 */

import { SalesBase } from "@/integrations/supabase/types/sales";

interface ValidationResult {
  valid: boolean;
  reason: string;
}

export const validateRequiredFields = (data: Partial<SalesBase>): ValidationResult => {
  if (!data.date) {
    return { valid: false, reason: 'Fecha es requerida' };
  }
  if (!data.orderNumber) {
    return { valid: false, reason: 'No. Orden es requerido' };
  }
  if (data.price === null && data.price !== 0) {
    return { valid: false, reason: 'Monto es requerido' };
  }
  
  return { valid: true, reason: '' };
};

export const validateDataTypes = (data: Partial<SalesBase>): ValidationResult => {
  if (data.price && typeof data.price !== 'number') {
    return { valid: false, reason: 'Monto debe ser un número' };
  }
  if (data.Quantity && typeof data.Quantity !== 'number') {
    return { valid: false, reason: 'Cantidad debe ser un número' };
  }
  if (data.profitMargin && typeof data.profitMargin !== 'number') {
    return { valid: false, reason: 'Margen debe ser un número' };
  }
  
  return { valid: true, reason: '' };
};

export const validateSalesData = (data: Partial<SalesBase>): ValidationResult => {
  const requiredFieldsValidation = validateRequiredFields(data);
  if (!requiredFieldsValidation.valid) {
    return requiredFieldsValidation;
  }

  const dataTypesValidation = validateDataTypes(data);
  if (!dataTypesValidation.valid) {
    return dataTypesValidation;
  }

  return { valid: true, reason: '' };
};
