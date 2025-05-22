
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TriggerStatusAlertProps {
  isVerifying: boolean;
  triggerStatus: any | null;
}

export function TriggerStatusAlert({ isVerifying, triggerStatus }: TriggerStatusAlertProps) {
  if (isVerifying) {
    return (
      <Alert variant="warning" className="mt-2">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Verificando configuración de reconciliación...
        </AlertDescription>
      </Alert>
    );
  }

  if (!triggerStatus) {
    return null;
  }

  if (!triggerStatus.success) {
    return (
      <Alert variant="destructive" className="mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No se pudieron verificar los triggers de la base de datos.
        </AlertDescription>
      </Alert>
    );
  }

  if (!triggerStatus.hasPaymentTrigger || !triggerStatus.hasSalesTrigger) {
    return (
      <Alert variant="warning" className="mt-2">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Advertencia</AlertTitle>
        <AlertDescription>
          No se encontraron todos los triggers de reconciliación. Se usará un método alternativo.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="success" className="mt-2">
      <CheckCircle2 className="h-4 w-4" />
      <AlertTitle>Sistema verificado</AlertTitle>
      <AlertDescription>
        Configuración de reconciliación verificada correctamente.
      </AlertDescription>
    </Alert>
  );
}
