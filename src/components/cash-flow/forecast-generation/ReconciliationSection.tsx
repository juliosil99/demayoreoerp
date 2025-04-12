
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { ForecastDataCount } from "./types";

interface ReconciliationSectionProps {
  reconcileBalances: boolean;
  setReconcileBalances: (value: boolean) => void;
  needsBalanceReconciliation: boolean;
  historicalDataCount: ForecastDataCount;
}

export function ReconciliationSection({
  reconcileBalances,
  setReconcileBalances,
  needsBalanceReconciliation,
  historicalDataCount
}: ReconciliationSectionProps) {
  // Log balance information for debugging
  console.log("[DEBUG] ReconciliationSection - Received balances:", {
    availableCashBalance: historicalDataCount.availableCashBalance,
    creditLiabilities: historicalDataCount.creditLiabilities,
    netPosition: historicalDataCount.netPosition
  });

  return (
    <div className="bg-muted/40 rounded-lg p-4 space-y-3">
      <h3 className="text-lg font-medium">Reconciliación de Saldos</h3>
      
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Label htmlFor="reconcile-balances" className="font-medium">
              Confirmar saldos actuales
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            {needsBalanceReconciliation 
              ? "Los saldos no han sido confirmados recientemente" 
              : "Saldos confirmados recientemente"}
          </p>
        </div>
        <Switch 
          id="reconcile-balances" 
          checked={reconcileBalances}
          onCheckedChange={setReconcileBalances}
        />
      </div>
      
      {reconcileBalances && (
        <div className="rounded-md bg-blue-50 p-3 mt-2">
          <div className="flex">
            <div className="text-sm text-blue-800">
              <p className="font-medium">Saldos que serán confirmados:</p>
              <ul className="mt-1 list-disc list-inside">
                <li>Disponible en cuentas de banco y efectivo: {formatCurrency(historicalDataCount.availableCashBalance || 0)}</li>
                <li>Pasivos en tarjetas de crédito: {formatCurrency(Math.abs(historicalDataCount.creditLiabilities || 0))}</li>
                <li>Posición neta: {formatCurrency(historicalDataCount.netPosition || 0)}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
