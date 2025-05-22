
import { Button } from "@/components/ui/button";
import { AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface DialogActionsProps {
  onReconcile: () => void;
  checkTriggers?: () => void;
  isVerifying: boolean;
  triggerStatus: any | null;
  showTriggerCheck?: boolean;
}

export function DialogActions({ 
  onReconcile, 
  checkTriggers, 
  isVerifying, 
  triggerStatus,
  showTriggerCheck = true
}: DialogActionsProps) {
  const needsManualMode = triggerStatus && 
    (!triggerStatus.success || !triggerStatus.hasPaymentTrigger || !triggerStatus.hasSalesTrigger);

  return (
    <>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={onReconcile}>
        {needsManualMode ? "Reconciliar (modo manual)" : "Reconciliar"}
      </AlertDialogAction>
      {showTriggerCheck && needsManualMode && (
        <Button 
          variant="outline" 
          className="ml-2" 
          onClick={checkTriggers}
          disabled={isVerifying}
        >
          Verificar DB
        </Button>
      )}
    </>
  );
}
