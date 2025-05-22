
import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface SystemStatusAlertProps {
  triggerStatus: any;
  isVerifyingDatabase: boolean;
  onVerify: () => void;
  onRepair: () => void;
}

export function SystemStatusAlert({
  triggerStatus,
  isVerifyingDatabase,
  onVerify,
  onRepair
}: SystemStatusAlertProps) {
  // If verification is still pending or was successful with all triggers present
  if (!triggerStatus || isVerifyingDatabase || 
      (triggerStatus.success && triggerStatus.hasPaymentTrigger && triggerStatus.hasSalesTrigger)) {
    return null;
  }

  // If the verification system is in degraded mode but not actually failing
  if (triggerStatus.degradedMode) {
    return (
      <Alert variant="default">
        <Info className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Información: El sistema está operando en modo manual de reconciliación.
            La verificación automática no está disponible en este momento.
          </span>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={onRepair}
              disabled={isVerifyingDatabase}
            >
              Reparar reconciliaciones
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // If there's an issue with the triggers or verification failed
  return (
    <Alert variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          Advertencia: La configuración de reconciliación automática no está completa. 
          Las reconciliaciones pueden requerir reparación manual.
          {!triggerStatus.success && " No se pudo verificar el estado de los triggers."}
          {triggerStatus.success && !triggerStatus.hasPaymentTrigger && " Falta el trigger para actualizaciones de pagos."}
          {triggerStatus.success && !triggerStatus.hasSalesTrigger && " Falta el trigger para actualizaciones de ventas."}
        </span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onVerify}
            disabled={isVerifyingDatabase}
          >
            Verificar
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onRepair}
            disabled={isVerifyingDatabase}
          >
            Reparar reconciliaciones
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
