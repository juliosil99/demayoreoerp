
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Info } from "lucide-react";

interface PayrollInvoiceInfoProps {
  payrollCount: number;
  totalPayrollAmount: number;
}

export function PayrollInvoiceInfo({ payrollCount, totalPayrollAmount }: PayrollInvoiceInfoProps) {
  if (payrollCount === 0) return null;
  
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <Users className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex items-center justify-between">
          <span>
            Se encontraron <strong>{payrollCount}</strong> facturas de nómina disponibles
          </span>
          <span className="text-sm font-medium">
            Total: ${totalPayrollAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="text-xs mt-1 text-blue-600">
          Las facturas de nómina son emitidas por tu empresa y pueden reconciliarse con gastos de sueldos y salarios.
        </div>
      </AlertDescription>
    </Alert>
  );
}
