
import { validateRequiredFields, validateDataTypes, validateSalesData } from '../salesValidation';
import { SalesBase } from '@/integrations/supabase/types/sales';

describe('validateRequiredFields', () => {
  it('should return valid=true when all required fields are present', () => {
    const validData: Partial<SalesBase> = {
      date: '2024-01-01',
      orderNumber: '12345',
      price: 100
    };
    
    const result = validateRequiredFields(validData);
    expect(result.valid).toBe(true);
    expect(result.reason).toBe('');
  });

  it('should validate date is required', () => {
    const invalidData: Partial<SalesBase> = {
      orderNumber: '12345',
      price: 100
    };
    
    const result = validateRequiredFields(invalidData);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Fecha es requerida');
  });

  it('should validate orderNumber is required', () => {
    const invalidData: Partial<SalesBase> = {
      date: '2024-01-01',
      price: 100
    };
    
    const result = validateRequiredFields(invalidData);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('No. Orden es requerido');
  });

  it('should validate price is required', () => {
    const invalidData: Partial<SalesBase> = {
      date: '2024-01-01',
      orderNumber: '12345'
    };
    
    const result = validateRequiredFields(invalidData);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Monto es requerido');
  });

  it('should allow price to be 0', () => {
    const validData: Partial<SalesBase> = {
      date: '2024-01-01',
      orderNumber: '12345',
      price: 0
    };
    
    const result = validateRequiredFields(validData);
    expect(result.valid).toBe(true);
    expect(result.reason).toBe('');
  });
});

describe('validateDataTypes', () => {
  it('should return valid=true when all data types are correct', () => {
    const validData: Partial<SalesBase> = {
      price: 100,
      Quantity: 5,
      profitMargin: 0.25
    };
    
    const result = validateDataTypes(validData);
    expect(result.valid).toBe(true);
    expect(result.reason).toBe('');
  });

  it('should validate price must be a number', () => {
    const invalidData = {
      price: '100' as any,
      Quantity: 5,
      profitMargin: 0.25
    };
    
    const result = validateDataTypes(invalidData);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Monto debe ser un número');
  });

  it('should validate quantity must be a number', () => {
    const invalidData = {
      price: 100,
      Quantity: '5' as any,
      profitMargin: 0.25
    };
    
    const result = validateDataTypes(invalidData);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Cantidad debe ser un número');
  });

  it('should validate profitMargin must be a number', () => {
    const invalidData = {
      price: 100,
      Quantity: 5,
      profitMargin: '0.25' as any
    };
    
    const result = validateDataTypes(invalidData);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Margen debe ser un número');
  });
});

describe('validateSalesData', () => {
  it('should validate both required fields and data types', () => {
    const validData: Partial<SalesBase> = {
      date: '2024-01-01',
      orderNumber: '12345',
      price: 100,
      Quantity: 5,
      profitMargin: 0.25
    };
    
    const result = validateSalesData(validData);
    expect(result.valid).toBe(true);
    expect(result.reason).toBe('');
  });

  it('should fail on missing required fields before checking data types', () => {
    const invalidData: Partial<SalesBase> = {
      orderNumber: '12345',
      price: '100' as any
    };
    
    const result = validateSalesData(invalidData);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Fecha es requerida');
  });

  it('should check data types after required fields pass', () => {
    const invalidData: Partial<SalesBase> = {
      date: '2024-01-01',
      orderNumber: '12345',
      price: '100' as any
    };
    
    const result = validateSalesData(invalidData);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Monto debe ser un número');
  });
});

