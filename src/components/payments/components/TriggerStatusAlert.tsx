
import { AlertTriangle, CheckCircle2, WifiOff, Info, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TriggerStatusAlertProps {
  isVerifying: boolean;
  triggerStatus: any;
}

export function TriggerStatusAlert({
  isVerifying,
  triggerStatus,
}: TriggerStatusAlertProps) {
  if (isVerifying) {
    return (
      <Alert variant="default">
        <Info className="h-4 w-4" />
        <AlertDescription>Verificando configuración de la base de datos...</AlertDescription>
      </Alert>
    );
  }

  // If there's an error but it's just the verification feature that's broken
  if (triggerStatus?.error && !triggerStatus.success) {
    return (
      <Alert variant="default">
        <WifiOff className="h-4 w-4" />
        <AlertDescription>
          No se pudo verificar los triggers de reconciliación. El sistema continuará funcionando en modo manual.
          {triggerStatus.degradedMode && " La verificación no está disponible en este momento."}
        </AlertDescription>
      </Alert>
    );
  }

  // Regular status displays when verification worked
  if (!triggerStatus) {
    return null;
  }

  if (!triggerStatus.hasPaymentTrigger || !triggerStatus.hasSalesTrigger) {
    return (
      <Alert variant="default" className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          Advertencia: La configuración de reconciliación automática no está completa.
          {!triggerStatus.hasPaymentTrigger && " Falta el trigger para actualizaciones de pagos."}
          {!triggerStatus.hasSalesTrigger && " Falta el trigger para actualizaciones de ventas."}
          <br />
          La reconciliación funcionará en modo manual.
          {triggerStatus.usedFallback && " (Utilizando método de verificación alternativo)"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="default" className="border-green-200 bg-green-50">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        La configuración de reconciliación automática está completa y funcionando correctamente.
        {triggerStatus.usedFallback && " (Verificado mediante método alternativo)"}
      </AlertDescription>
    </Alert>
  );
}
