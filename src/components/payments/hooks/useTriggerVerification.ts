
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { checkReconciliationTriggers } from "@/integrations/supabase/triggers";

export function useTriggerVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [triggerStatus, setTriggerStatus] = useState<any>(null);
  const { toast } = useToast();

  const checkTriggers = async () => {
    setIsVerifying(true);
    const result = await checkReconciliationTriggers();
    setTriggerStatus(result);
    setIsVerifying(false);
    
    if (!result || !result.success) {
      toast({
        title: "Advertencia",
        description: "No se pudieron verificar los triggers de reconciliación. El proceso de reconciliación puede no funcionar correctamente.",
        variant: "destructive",
      });
    } else if (!result.hasPaymentTrigger || !result.hasSalesTrigger) {
      toast({
        description: "Faltan algunos triggers de reconciliación. Se utilizará un método alternativo de cálculo.",
        variant: "warning",
      });
    } else {
      toast({
        title: "Sistema verificado",
        description: "La configuración de reconciliación funciona correctamente.",
        variant: "success"
      });
    }
  };

  return {
    isVerifying,
    triggerStatus,
    checkTriggers,
    setTriggerStatus
  };
}
