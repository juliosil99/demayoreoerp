
import { AlertTriangle } from "lucide-react";
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
  // Only show the alert when there's a problem with the configuration
  if (!triggerStatus || (triggerStatus.success && triggerStatus.hasPaymentTrigger && triggerStatus.hasSalesTrigger)) {
    return null;
  }

  return (
    <Alert variant="default">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          Advertencia: La configuración de reconciliación automática no está completa. 
          Las reconciliaciones pueden requerir reparación manual.
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
