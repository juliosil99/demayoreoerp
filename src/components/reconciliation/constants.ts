
// Default chart accounts for adjustments
export const ADJUSTMENT_ACCOUNTS = {
  // When expense amount > invoice amount (we paid more)
  expense_excess: {
    code: "107.05",
    name: "Anticipo a Proveedores",
    description: "Registra el excedente pagado como anticipo a proveedor"
  },
  // When invoice amount > expense amount (we paid less) - corrected to use liability account
  invoice_excess: {
    code: "201.01", 
    name: "Cuentas por Pagar",
    description: "Registra la diferencia como deuda pendiente por pagar"
  }
} as const;

export const RECONCILIATION_TYPES = {
  automatic: "Conciliación Automática",
  manual: "Conciliación Manual",
  partial: "Conciliación Parcial"
} as const;
