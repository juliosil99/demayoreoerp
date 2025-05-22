
import { useState, useEffect, useCallback } from "react";
import { checkReconciliationTriggers, manualRecalculateReconciliation } from "@/integrations/supabase/triggers";
import { useToast } from "@/hooks/use-toast";

// Update the import path to correctly reference the Payment type
import type { Payment } from "@/components/payments/PaymentForm";

// Extend the Payment type to include the properties we need
interface PaymentWithReconciliation extends Payment {
  is_reconciled?: boolean;
  reconciled_amount?: number;
}

export function useSystemVerification(payments?: PaymentWithReconciliation[]) {
  const [triggerStatus, setTriggerStatus] = useState<any>(null);
  const [isVerifyingDatabase, setIsVerifyingDatabase] = useState(false);
  const { toast } = useToast();

  // Memoize the verification function to prevent it from changing on every render
  const verifyDatabaseConfiguration = useCallback(async () => {
    setIsVerifyingDatabase(true);
    try {
      const result = await checkReconciliationTriggers();
      setTriggerStatus(result);
      
      if (!result.success) {
        toast({
          title: "Advertencia del sistema",
          description: "No se pudieron verificar los triggers de reconciliación en la base de datos",
          variant: "destructive",
        });
      } else if (!result.hasPaymentTrigger || !result.hasSalesTrigger) {
        toast({
          title: "Advertencia de configuración",
          description: "La configuración de reconciliación automática no está completa",
          variant: "default",
        });
        
        // Check reconciled payments that might need recalculation
        const paymentIds = payments
          ?.filter(p => p.is_reconciled && (!p.reconciled_amount || p.reconciled_amount === 0))
          .map(p => p.id);
          
        if (paymentIds && paymentIds.length > 0) {
          toast({
            title: "Reparación disponible",
            description: `Se encontraron ${paymentIds.length} pagos reconciliados con montos incorrectos que pueden ser reparados`,
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error("Error verificando configuración:", error);
    } finally {
      setIsVerifyingDatabase(false);
    }
  }, [toast, payments]); // Only depend on toast and payments

  // Perform a system check when component loads
  useEffect(() => {
    verifyDatabaseConfiguration();
  }, [verifyDatabaseConfiguration]);

  const handleRepairReconciliations = async () => {
    try {
      const paymentIds = payments
        ?.filter(p => p.is_reconciled && (!p.reconciled_amount || p.reconciled_amount === 0))
        .map(p => p.id) || [];
        
      if (paymentIds.length === 0) {
        toast({
          title: "Información",
          description: "No hay pagos reconciliados que necesiten reparación",
        });
        return;
      }
      
      toast({
        title: "Reparación iniciada",
        description: `Reparando ${paymentIds.length} pagos...`,
      });
      
      let repaired = 0;
      for (const paymentId of paymentIds) {
        const result = await manualRecalculateReconciliation(paymentId);
        if (result.success) repaired++;
      }
      
      toast({
        title: "Reparación completada",
        description: `Se repararon ${repaired} pagos de ${paymentIds.length}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error reparando reconciliaciones:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error durante la reparación",
        variant: "destructive",
      });
    }
  };

  return {
    triggerStatus,
    isVerifyingDatabase,
    verifyDatabaseConfiguration,
    handleRepairReconciliations
  };
}
