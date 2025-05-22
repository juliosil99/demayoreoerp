
import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface SystemStatusAlertProps {
  triggerStatus: any;
  isVerifyingDatabase: boolean;
  isRepairing?: boolean;
  repairablePayments?: string[];
  onVerify: () => void;
  onRepair: () => void;
}

export function SystemStatusAlert({
  triggerStatus,
  isVerifyingDatabase,
  isRepairing = false,
  repairablePayments = [],
  onVerify,
  onRepair
}: SystemStatusAlertProps) {
  // Si la verificación está en proceso, mostrar mensaje de carga
  if (isVerifyingDatabase) {
    return (
      <Alert variant="default">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Verificando configuración de la base de datos...
        </AlertDescription>
      </Alert>
    );
  }

  // Si no hay estado de triggers o la verificación fue exitosa con todos los triggers presentes, no mostrar nada
  if (!triggerStatus || 
      (triggerStatus.success && triggerStatus.hasPaymentTrigger && triggerStatus.hasSalesTrigger)) {
    return null;
  }

  // Si el sistema está en modo degradado pero no realmente fallando
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
              disabled={isVerifyingDatabase || isRepairing}
            >
              {isRepairing ? "Reparando..." : "Reparar reconciliaciones"}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Si hay problemas con los triggers o la verificación falló
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
          {repairablePayments && repairablePayments.length > 0 && 
            ` Se encontraron ${repairablePayments.length} pagos que podrían necesitar reparación.`}
        </span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onVerify}
            disabled={isVerifyingDatabase || isRepairing}
          >
            Verificar
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onRepair}
            disabled={isVerifyingDatabase || isRepairing}
          >
            {isRepairing ? "Reparando..." : "Reparar reconciliaciones"}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
