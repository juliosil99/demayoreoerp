
// Cuentas contables específicas para ajustes de reconciliación
export const ADJUSTMENT_ACCOUNTS = {
  // Cuando el gasto es mayor que la factura (se pagó de más)
  expense_excess: {
    code: "107.05",
    name: "Anticipo a Proveedores",
    description: "Registra el exceso pagado como anticipo que se aplicará en futuras compras"
  },
  // Cuando la factura es mayor que el gasto (se pagó de menos)
  invoice_excess: {
    code: "201.01", 
    name: "Cuentas por Pagar",
    description: "Registra el saldo pendiente por pagar al proveedor"
  }
} as const;

export const RECONCILIATION_TYPES = {
  automatic: "Conciliación Automática",
  manual: "Conciliación Manual",
  partial: "Conciliación Parcial"
} as const;

// Tipos para TypeScript
export type AdjustmentAccountType = keyof typeof ADJUSTMENT_ACCOUNTS;
export type ReconciliationType = keyof typeof RECONCILIATION_TYPES;
