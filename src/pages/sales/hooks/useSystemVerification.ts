
import { useState, useEffect, useCallback } from "react";
import { checkReconciliationTriggers, manualRecalculateReconciliation } from "@/integrations/supabase/triggers";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [repairablePayments, setRepairablePayments] = useState<string[]>([]);
  const [isRepairing, setIsRepairing] = useState(false);
  const { toast } = useToast();

  // Memoize the verification function to prevent it from changing on every render
  const verifyDatabaseConfiguration = useCallback(async () => {
    setIsVerifyingDatabase(true);
    try {
      const result = await checkReconciliationTriggers();
      setTriggerStatus(result);
      
      if (!result.success) {
        // Different messaging depending on the nature of the failure
        if (result.degradedMode) {
          toast({
            title: "Modo verificación limitado",
            description: "El sistema funcionará en modo manual de reconciliación",
            variant: "default",
          });
        } else {
          toast({
            title: "Advertencia del sistema",
            description: "No se pudieron verificar los triggers de reconciliación en la base de datos",
            variant: "destructive",
          });
        }
      } else if (!result.hasPaymentTrigger || !result.hasSalesTrigger) {
        toast({
          title: "Advertencia de configuración",
          description: "La configuración de reconciliación automática no está completa",
          variant: "default",
        });
        
        // Find potentially problematic reconciliations
        await checkForProblematicReconciliations();
      }
    } catch (error) {
      console.error("Error verificando configuración:", error);
      setTriggerStatus({
        success: false,
        error: String(error),
        degradedMode: true
      });
    } finally {
      setIsVerifyingDatabase(false);
    }
  }, [toast]); // Only depend on toast

  // New function to check for problematic reconciliations
  const checkForProblematicReconciliations = async () => {
    try {
      // Get all reconciled payments first
      const { data: reconciledPayments, error } = await supabase
        .from('payments')
        .select('id, amount, reconciled_amount, reconciled_count')
        .eq('is_reconciled', true);
        
      if (error) {
        console.error("Error fetching reconciled payments:", error);
        return;
      }
      
      // Identify potentially problematic reconciliations
      const potentiallyProblematic = reconciledPayments.filter(p => {
        // Payments with reconciled flag but no amount or count
        return p.reconciled_amount === 0 || p.reconciled_count === 0 || 
               p.reconciled_amount === null || p.reconciled_count === null || 
               (p.amount > 0 && p.reconciled_amount !== p.amount); 
      });
      
      if (potentiallyProblematic.length > 0) {
        console.log(`Found ${potentiallyProblematic.length} potentially problematic reconciliations`);
        setRepairablePayments(potentiallyProblematic.map(p => p.id));
        
        toast({
          title: "Reparación disponible",
          description: `Se encontraron ${potentiallyProblematic.length} pagos reconciliados que podrían necesitar reparación`,
          variant: "default",
        });
      }
    } catch (e) {
      console.error("Error checking for problematic reconciliations:", e);
    }
  };

  // Perform a system check when component loads
  useEffect(() => {
    verifyDatabaseConfiguration();
  }, [verifyDatabaseConfiguration]);

  const handleRepairReconciliations = async () => {
    try {
      setIsRepairing(true);
      
      // If we have identified potentially problematic payments, use those first
      const paymentIdsToCheck = repairablePayments.length > 0 
        ? repairablePayments 
        : payments?.filter(p => p.is_reconciled).map(p => p.id) || [];
      
      if (paymentIdsToCheck.length === 0) {
        toast({
          title: "Información",
          description: "No hay pagos reconciliados que necesiten reparación",
        });
        return;
      }
      
      toast({
        title: "Reparación iniciada",
        description: `Verificando ${paymentIdsToCheck.length} pagos...`,
      });
      
      let repaired = 0;
      let alreadyOk = 0;
      const repairedDetails: string[] = [];
      
      for (const paymentId of paymentIdsToCheck) {
        const result = await manualRecalculateReconciliation(paymentId);
        
        if (result.success) {
          if (result.needsRepair) {
            repaired++;
            if (result.sales) {
              repairedDetails.push(`Pago ${paymentId.substring(0, 8)}: ${result.reconciled_count} ventas por ${result.reconciled_amount} (${result.sales})`);
            }
          } else {
            alreadyOk++;
          }
        }
      }
      
      if (repaired > 0) {
        toast({
          title: "Reparación completada",
          description: `Se repararon ${repaired} pagos de ${paymentIdsToCheck.length}`,
          variant: "default",
        });
        
        // Log details to console for debugging
        console.log("Reparaciones realizadas:", repairedDetails);
      } else {
        toast({
          title: "Información",
          description: `Se verificaron ${paymentIdsToCheck.length} pagos. Todos estaban correctamente reconciliados.`,
        });
      }
      
      // Clear the repairable payments since we've processed them
      setRepairablePayments([]);
    } catch (error) {
      console.error("Error reparando reconciliaciones:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error durante la reparación",
        variant: "destructive",
      });
    } finally {
      setIsRepairing(false);
    }
  };

  return {
    triggerStatus,
    isVerifyingDatabase,
    isRepairing,
    repairablePayments,
    verifyDatabaseConfiguration,
    handleRepairReconciliations
  };
}
