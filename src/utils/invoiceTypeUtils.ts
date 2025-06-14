
export interface InvoiceTypeInfo {
  label: string;
  color: string;
  description: string;
}

export const INVOICE_TYPE_MAP: Record<string, InvoiceTypeInfo> = {
  'I': {
    label: 'Ingreso',
    color: 'bg-green-100 text-green-800 border-green-300',
    description: 'Comprobante de Ingreso'
  },
  'E': {
    label: 'Egreso',
    color: 'bg-red-100 text-red-800 border-red-300',
    description: 'Comprobante de Egreso (Nota de Crédito)'
  },
  'N': {
    label: 'Nómina',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Comprobante de Nómina'
  },
  'P': {
    label: 'Pago',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Comprobante de Recepción de Pagos'
  },
  'T': {
    label: 'Traslado',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    description: 'Comprobante de Ingreso de Traslado'
  },
  'R': {
    label: 'Retenciones',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    description: 'Comprobante de Retenciones e Información de Pagos'
  }
};

export const getInvoiceTypeInfo = (invoiceType: string | null): InvoiceTypeInfo => {
  if (!invoiceType || !INVOICE_TYPE_MAP[invoiceType]) {
    return {
      label: 'Desconocido',
      color: 'bg-gray-50 text-gray-600 border-gray-200',
      description: 'Tipo de comprobante no identificado'
    };
  }
  
  return INVOICE_TYPE_MAP[invoiceType];
};
