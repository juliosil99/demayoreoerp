
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/utils/formatters";
import { DiscrepancyResult } from "../utils/discrepancyDetection";

interface DiscrepancyAlertProps {
  discrepancy: DiscrepancyResult;
}

export function DiscrepancyAlert({ discrepancy }: DiscrepancyAlertProps) {
  if (!discrepancy.hasDiscrepancy) return null;

  return (
    <Alert variant="destructive" className="bg-red-50 border-red-200">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-600">
        {discrepancy.type === 'amount' && (
          <>
            Se detectó una discrepancia en el monto: {' '}
            <span className="font-semibold">
              {formatCurrency(discrepancy.difference || 0)}
            </span>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}
