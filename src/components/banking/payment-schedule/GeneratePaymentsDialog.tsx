
import React from "react";
import { AlertCircle, DollarSign } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/utils/formatters";
import { BankAccount } from "@/components/banking/types";

interface GeneratePaymentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: BankAccount;
  months: number;
  onMonthsChange: (months: number) => void;
  onGenerate: () => void;
}

export function GeneratePaymentsDialog({
  open,
  onOpenChange,
  account,
  months,
  onMonthsChange,
  onGenerate
}: GeneratePaymentsDialogProps) {
  const canGeneratePayments = 
    !!account.payment_due_day && 
    ((account.type === "Credit Card" && !!account.minimum_payment_percentage) ||
     (account.type === "Credit Simple" && !!account.monthly_payment));
     
  const paymentAmount = account.type === "Credit Card" 
    ? (account.balance ?? 0) * (account.minimum_payment_percentage ?? 10) / 100 
    : account.monthly_payment ?? 0;
    
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generar Pagos Automáticos</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {!account.payment_due_day && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuración incompleta</AlertTitle>
              <AlertDescription>
                Esta cuenta no tiene configurado el día de pago. Por favor, edita la cuenta para agregar esta información.
              </AlertDescription>
            </Alert>
          )}
          
          {(account.type === "Credit Card" && !account.minimum_payment_percentage) && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuración incompleta</AlertTitle>
              <AlertDescription>
                Esta tarjeta no tiene configurado el porcentaje de pago mínimo. Por favor, edita la cuenta para agregar esta información.
              </AlertDescription>
            </Alert>
          )}
          
          {(account.type === "Credit Simple" && !account.monthly_payment) && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuración incompleta</AlertTitle>
              <AlertDescription>
                Este crédito no tiene configurado el pago mensual. Por favor, edita la cuenta para agregar esta información.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="months">Número de Meses</Label>
              <Input
                id="months"
                type="number"
                min="1"
                max="36"
                value={months}
                onChange={(e) => onMonthsChange(parseInt(e.target.value) || 6)}
              />
              <p className="text-sm text-muted-foreground">
                Se generarán {months} pagos mensuales a partir del próximo día de pago.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label>Monto de Cada Pago</Label>
              <div className="flex items-center rounded-md border px-3 py-2 bg-muted/50">
                <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{formatCurrency(paymentAmount)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {account.type === "Credit Card" 
                  ? `${account.minimum_payment_percentage ?? 10}% del saldo actual (${formatCurrency(account.balance ?? 0)})`
                  : 'Pago mensual configurado'}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={onGenerate}
            disabled={!canGeneratePayments}
          >
            Generar Pagos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
