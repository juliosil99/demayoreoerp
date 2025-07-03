import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { isAutoReconciliationEligible } from "@/utils/channelUtils";
import type { UnreconciledSale } from "../types/UnreconciledSale";

export interface AutoReconciliationGroup {
  id: string;
  date: string;
  paymentMethod: string;
  channel: string;
  channelType: string;
  sales: UnreconciledSale[];
  totalAmount: number;
  status: 'perfect' | 'minor_discrepancy' | 'major_discrepancy';
  discrepancyAmount?: number;
  validationErrors: string[];
}

interface AutoReconciliationResult {
  successCount: number;
  errorCount: number;
  groups: AutoReconciliationGroup[];
  errors: Array<{ groupId: string; error: string }>;
}

export function useAutoReconciliation() {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const detectAutoReconciliationGroups = useCallback(async (): Promise<AutoReconciliationGroup[]> => {
    try {
      // Get sales channels with type information
      const { data: channels } = await supabase
        .from("sales_channels")
        .select("id, name, type_channel")
        .eq("is_active", true);

      if (!channels) return [];

      // Filter only retail_own channels
      const retailOwnChannels = channels.filter(channel => 
        isAutoReconciliationEligible(channel.type_channel as any)
      );

      if (retailOwnChannels.length === 0) return [];

      // Get unreconciled sales for retail own channels
      const channelNames = retailOwnChannels.map(c => c.name);
      
      const { data: sales } = await supabase
        .from("Sales")
        .select(`
          id,
          date,
          Channel,
          orderNumber,
          price,
          productName,
          comission,
          retention,
          shipping,
          payment_method,
          datePaid,
          statusPaid
        `)
        .is("reconciliation_id", null)
        .in("Channel", channelNames)
        .not("date", "is", null)
        .not("price", "is", null);

      if (!sales || sales.length === 0) return [];

      // Group sales by date, payment method, and channel
      const groupsMap = new Map<string, UnreconciledSale[]>();
      
      sales.forEach(sale => {
        const key = `${sale.date}-${sale.payment_method}-${sale.Channel}`;
        if (!groupsMap.has(key)) {
          groupsMap.set(key, []);
        }
        groupsMap.get(key)!.push(sale as unknown as UnreconciledSale);
      });

      // Convert to AutoReconciliationGroup array
      const groups: AutoReconciliationGroup[] = [];
      
      groupsMap.forEach((salesGroup, key) => {
        const [date, paymentMethod, channel] = key.split('-');
        const channelInfo = retailOwnChannels.find(c => c.name === channel);
        
        if (!channelInfo) return;

        const group = validateGroup({
          id: crypto.randomUUID(),
          date,
          paymentMethod,
          channel,
          channelType: channelInfo.type_channel,
          sales: salesGroup,
          validationErrors: []
        });

        groups.push(group);
      });

      return groups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error("Error detecting auto-reconciliation groups:", error);
      return [];
    }
  }, []);

  const validateGroup = useCallback((group: Omit<AutoReconciliationGroup, 'totalAmount' | 'status' | 'discrepancyAmount'>): AutoReconciliationGroup => {
    const validationErrors: string[] = [];
    let totalAmount = 0;
    let discrepancyAmount = 0;

    // Calculate total amount
    totalAmount = group.sales.reduce((sum, sale) => sum + (sale.price || 0), 0);

    // Validation rules for auto-reconciliation
    group.sales.forEach((sale, index) => {
      // Check if date matches datePaid (if exists)
      if (sale.datePaid && sale.datePaid !== sale.date) {
        validationErrors.push(`Venta ${index + 1}: Fecha de venta y fecha de pago no coinciden`);
      }

      // Check for commissions, retention, shipping (should be 0 for auto-reconciliation)
      if ((sale.comission || 0) !== 0) {
        discrepancyAmount += Math.abs(sale.comission || 0);
        validationErrors.push(`Venta ${index + 1}: Tiene comisión (${sale.comission})`);
      }

      if ((sale.retention || 0) !== 0) {
        discrepancyAmount += Math.abs(sale.retention || 0);
        validationErrors.push(`Venta ${index + 1}: Tiene retención (${sale.retention})`);
      }

      if ((sale.shipping || 0) !== 0) {
        discrepancyAmount += Math.abs(sale.shipping || 0);
        validationErrors.push(`Venta ${index + 1}: Tiene envío (${sale.shipping})`);
      }

      // Check if already paid
      if (sale.statusPaid === 'cobrado') {
        validationErrors.push(`Venta ${index + 1}: Ya está marcada como cobrada`);
      }
    });

    // Determine status based on discrepancies
    let status: AutoReconciliationGroup['status'] = 'perfect';
    
    if (validationErrors.length > 0) {
      if (discrepancyAmount < 1.00) {
        status = 'minor_discrepancy';
      } else {
        status = 'major_discrepancy';
      }
    }

    return {
      ...group,
      totalAmount,
      status,
      discrepancyAmount: discrepancyAmount > 0 ? discrepancyAmount : undefined,
      validationErrors
    };
  }, []);

  const createAutomaticPayments = useCallback(async (groups: AutoReconciliationGroup[]): Promise<AutoReconciliationResult> => {
    const result: AutoReconciliationResult = {
      successCount: 0,
      errorCount: 0,
      groups: [],
      errors: []
    };

    for (const group of groups) {
      try {
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          throw new Error("Usuario no autenticado");
        }

        // Create payment record
        const { data: payment, error: paymentError } = await supabase
          .from("payments")
          .insert({
            date: group.date,
            amount: group.totalAmount,
            payment_method: group.paymentMethod,
            reference_number: `AUTO-${group.date}-${group.channel}`,
            account_id: 1, // Default account, should be configurable
            notes: `Auto-reconciliación ${group.channel} - ${group.date}`,
            status: 'confirmed',
            is_reconciled: true,
            reconciled_amount: group.totalAmount,
            reconciled_count: group.sales.length,
            user_id: userData.user.id
          })
          .select("id")
          .single();

        if (paymentError || !payment) {
          throw new Error(`Error creando pago: ${paymentError?.message}`);
        }

        // Update sales with reconciliation
        const salesIds = group.sales.map(sale => sale.id);
        const { error: salesError } = await supabase
          .from("Sales")
          .update({
            reconciliation_id: payment.id,
            statusPaid: 'cobrado',
            datePaid: group.date
          })
          .in("id", salesIds);

        if (salesError) {
          // Rollback payment creation
          await supabase.from("payments").delete().eq("id", payment.id);
          throw new Error(`Error actualizando ventas: ${salesError.message}`);
        }

        result.successCount++;
        result.groups.push({ ...group, id: payment.id });

      } catch (error) {
        console.error(`Error processing group ${group.id}:`, error);
        result.errorCount++;
        result.errors.push({
          groupId: group.id,
          error: error instanceof Error ? error.message : "Error desconocido"
        });
      }
    }

    return result;
  }, []);

  const processAutoReconciliationMutation = useMutation({
    mutationFn: async (groups: AutoReconciliationGroup[]) => {
      console.log("Starting auto-reconciliation process:", groups);
      return await createAutomaticPayments(groups);
    },
    onSuccess: (result) => {
      toast({
        title: "Auto-Reconciliación Completada",
        description: `${result.successCount} grupos procesados exitosamente. ${result.errorCount} errores.`,
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["optimized-payments-reconciliation"] });
      queryClient.invalidateQueries({ queryKey: ["optimized-unreconciled-sales"] });
      queryClient.invalidateQueries({ queryKey: ["optimized-payments"] });
      
      // Reset selection
      setSelectedGroups([]);
    },
    onError: (error) => {
      console.error("Auto-reconciliation failed:", error);
      toast({
        title: "Error en Auto-Reconciliación",
        description: "No se pudo completar el proceso de auto-reconciliación.",
        variant: "destructive",
      });
    },
  });

  const rollbackReconciliation = useCallback(async (paymentId: string): Promise<boolean> => {
    try {
      // Get sales to rollback
      const { data: sales } = await supabase
        .from("Sales")
        .select("id")
        .eq("reconciliation_id", paymentId);

      if (sales && sales.length > 0) {
        // Reset sales reconciliation
        const { error: salesError } = await supabase
          .from("Sales")
          .update({
            reconciliation_id: null,
            statusPaid: null,
            datePaid: null
          })
          .in("id", sales.map(s => s.id));

        if (salesError) {
          throw new Error(`Error resetting sales: ${salesError.message}`);
        }
      }

      // Delete payment
      const { error: paymentError } = await supabase
        .from("payments")
        .delete()
        .eq("id", paymentId);

      if (paymentError) {
        throw new Error(`Error deleting payment: ${paymentError.message}`);
      }

      toast({
        title: "Rollback Exitoso",
        description: "La reconciliación ha sido revertida correctamente.",
      });

      return true;
    } catch (error) {
      console.error("Rollback failed:", error);
      toast({
        title: "Error en Rollback",
        description: "No se pudo revertir la reconciliación.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  return {
    selectedGroups,
    setSelectedGroups,
    detectAutoReconciliationGroups,
    validateGroup,
    processAutoReconciliation: processAutoReconciliationMutation.mutate,
    isProcessing: processAutoReconciliationMutation.isPending,
    rollbackReconciliation
  };
}