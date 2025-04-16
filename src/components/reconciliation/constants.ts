
// Default chart accounts for adjustments
export const ADJUSTMENT_ACCOUNTS = {
  // When expense amount > invoice amount (we paid more)
  expense_excess: {
    code: "107.05",
    name: "Anticipo a Proveedores",
    description: "Registra el excedente pagado como anticipo a proveedor"
  },
  // When invoice amount > expense amount (we paid less)
  invoice_excess: {
    code: "205.01", 
    name: "Anticipo de Clientes",
    description: "Registra la diferencia como anticipo recibido"
  }
} as const;

export const RECONCILIATION_TYPES = {
  automatic: "Conciliación Automática",
  manual: "Conciliación Manual",
  partial: "Conciliación Parcial"
} as const;
