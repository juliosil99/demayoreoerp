
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { checkReconciliationTriggers } from "@/integrations/supabase/triggers";

export function useTriggerVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [triggerStatus, setTriggerStatus] = useState<any>(null);
  const { toast } = useToast();

  // Use useCallback to memoize the function and prevent it from changing on each render
  const checkTriggers = useCallback(async () => {
    setIsVerifying(true);
    try {
      const result = await checkReconciliationTriggers();
      setTriggerStatus(result);
      
      if (!result.success) {
        // If verification failed but we're in degraded mode, show a different message
        if (result.degradedMode) {
          toast({
            title: "Modo de verificación limitado",
            description: "La verificación de triggers no está disponible. El sistema funcionará en modo manual.",
            variant: "default",
          });
        } else {
          toast({
            title: "Error de verificación",
            description: "No se pudieron verificar los triggers de reconciliación",
            variant: "destructive",
          });
        }
      } else if (!result.hasPaymentTrigger || !result.hasSalesTrigger) {
        toast({
          title: "Advertencia",
          description: "La configuración de reconciliación automática no está completa",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error checking triggers:", error);
      setTriggerStatus({
        success: false,
        error: String(error),
        degradedMode: true
      });
      
      toast({
        title: "Error",
        description: "Error al verificar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  }, [toast]); // Only toast is a dependency now

  return {
    isVerifying,
    triggerStatus,
    checkTriggers,
    setTriggerStatus
  };
}
