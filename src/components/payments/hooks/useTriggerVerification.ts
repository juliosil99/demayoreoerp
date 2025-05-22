
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { checkReconciliationTriggers } from "@/integrations/supabase/triggers";

export function useTriggerVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [triggerStatus, setTriggerStatus] = useState<any>(null);
  const { toast } = useToast();

  const checkTriggers = async () => {
    setIsVerifying(true);
    try {
      const result = await checkReconciliationTriggers();
      setTriggerStatus(result);
      
      if (!result.success) {
        toast({
          title: "Error de verificación",
          description: "No se pudieron verificar los triggers de reconciliación",
          variant: "destructive",
        });
      } else if (!result.hasPaymentTrigger || !result.hasSalesTrigger) {
        toast({
          title: "Advertencia",
          description: "La configuración de reconciliación automática no está completa",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error checking triggers:", error);
      toast({
        title: "Error",
        description: "Error al verificar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isVerifying,
    triggerStatus,
    checkTriggers,
    setTriggerStatus
  };
}
