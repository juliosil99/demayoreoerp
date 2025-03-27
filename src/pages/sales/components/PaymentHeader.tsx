
import { PlusIcon, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentHeaderProps {
  onOpenAddPayment: () => void;
  onOpenBulkReconciliation: () => void;
}

export function PaymentHeader({ onOpenAddPayment, onOpenBulkReconciliation }: PaymentHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Pagos Recibidos</h1>
      <div className="flex gap-2">
        <Button onClick={onOpenBulkReconciliation} variant="outline">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Reconciliación Masiva
        </Button>
        <Button onClick={onOpenAddPayment}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Agregar Pago
        </Button>
      </div>
    </div>
  );
}
