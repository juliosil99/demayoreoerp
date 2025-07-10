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
      // Auto-reconciliation detection started
      
      // Get sales channels with type information
      const { data: channels } = await supabase
        .from("sales_channels")
        .select("id, name, type_channel")
        .eq("is_active", true);

      console.log("📋 [CHANNELS] Retrieved channels:", channels);

      if (!channels) {
        console.log("❌ [CHANNELS] No channels found");
        return [];
      }

      // Filter only retail_own channels
      const retailOwnChannels = channels.filter(channel => 
        isAutoReconciliationEligible(channel.type_channel as any)
      );

      console.log("🏪 [RETAIL_OWN] Filtered retail_own channels:", retailOwnChannels);

      if (retailOwnChannels.length === 0) {
        console.log("❌ [RETAIL_OWN] No retail_own channels found");
        return [];
      }

      // Get unreconciled sales for retail own channels
      const channelNames = retailOwnChannels.map(c => c.name);
      console.log("🔗 [CHANNEL_NAMES] Channel names to query:", channelNames);
      
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

      if (!sales || sales.length === 0) {
        return [];
      }

      // Log specific sales for June 23rd JM208
      const june23JM208 = sales.filter(s => s.date === '2025-06-23' && s.Channel === 'JM208');
      console.log("🎯 [TARGET_SALES] June 23rd JM208 sales:", june23JM208);

      // Group sales by date, payment method, and channel
      const groupsMap = new Map<string, UnreconciledSale[]>();
      
      sales.forEach(sale => {
        const key = `${sale.date}__${sale.payment_method}__${sale.Channel}`;
        console.log(`🗂️ [GROUPING] Processing sale ${sale.id}, key: "${key}"`);
        
        if (!groupsMap.has(key)) {
          groupsMap.set(key, []);
          console.log(`✨ [NEW_GROUP] Created new group: "${key}"`);
        }
        groupsMap.get(key)!.push(sale as unknown as UnreconciledSale);
      });

      console.log("📦 [GROUPS_MAP] Total groups created:", groupsMap.size);
      console.log("📦 [GROUPS_KEYS] Group keys:", Array.from(groupsMap.keys()));

      // Convert to AutoReconciliationGroup array
      const groups: AutoReconciliationGroup[] = [];
      
      groupsMap.forEach((salesGroup, key) => {
        console.log(`🔍 [PROCESSING_GROUP] Processing group: "${key}" with ${salesGroup.length} sales`);
        
        const [date, paymentMethod, channel] = key.split('__');
        const channelInfo = retailOwnChannels.find(c => c.name === channel);
        
        console.log(`📊 [GROUP_INFO] Date: ${date}, PaymentMethod: ${paymentMethod}, Channel: ${channel}`);
        console.log(`🏪 [CHANNEL_INFO] Channel info found:`, channelInfo);
        
        if (!channelInfo) {
          console.log(`❌ [CHANNEL_NOT_FOUND] Channel ${channel} not found in retail_own channels`);
          return;
        }

        const group = validateGroup({
          id: crypto.randomUUID(),
          date,
          paymentMethod,
          channel,
          channelType: channelInfo.type_channel,
          sales: salesGroup,
          validationErrors: []
        });

        console.log(`✅ [GROUP_VALIDATED] Group validated:`, {
          id: group.id,
          date: group.date,
          paymentMethod: group.paymentMethod,
          channel: group.channel,
          salesCount: group.sales.length,
          totalAmount: group.totalAmount,
          status: group.status,
          validationErrors: group.validationErrors
        });

        groups.push(group);
      });

      console.log("🎉 [FINAL_RESULT] Total valid groups:", groups.length);
      console.log("🎉 [FINAL_GROUPS] Groups summary:", groups.map(g => ({
        date: g.date,
        channel: g.channel,
        paymentMethod: g.paymentMethod,
        salesCount: g.sales.length,
        totalAmount: g.totalAmount,
        status: g.status
      })));

      return groups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error("💥 [ERROR] Error detecting auto-reconciliation groups:", error);
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
    console.log("🔄 [AUTO-RECONCILIATION] Starting payment search for groups:", groups);
    
    const result: AutoReconciliationResult = {
      successCount: 0,
      errorCount: 0,
      groups: [],
      errors: []
    };

    console.log("📊 [AUTO-RECONCILIATION] Processing", groups.length, "groups");

    for (const group of groups) {
      try {
        console.log("🔍 [AUTO-RECONCILIATION] Searching existing payment for group:", {
          id: group.id,
          date: group.date,
          channel: group.channel,
          paymentMethod: group.paymentMethod,
          salesCount: group.sales.length,
          totalAmount: group.totalAmount
        });

        // Search for existing unreconciled payment that matches
        const { data: existingPayments, error: searchError } = await supabase
          .from("payments")
          .select("id, date, amount, payment_method, is_reconciled")
          .eq("is_reconciled", false)
          .eq("amount", group.totalAmount)
          .gte("date", group.date) // Same date or up to 1 day later
          .lte("date", new Date(new Date(group.date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        // Payment search completed

        if (searchError) {
          throw new Error(`Error buscando pagos existentes: ${searchError.message}`);
        }

        // Filter by payment method compatibility
        const compatiblePayments = existingPayments?.filter(payment => {
          const paymentMethodMatch = payment.payment_method === group.paymentMethod || 
                                   (payment.payment_method === 'cash' && group.paymentMethod === 'efectivo') ||
                                   (payment.payment_method === 'efectivo' && group.paymentMethod === 'cash');
          return paymentMethodMatch;
        }) || [];

        // Compatible payments filtered

        if (compatiblePayments.length === 0) {
          throw new Error(`No se encontró pago correspondiente para ${group.date} por $${group.totalAmount}. Verifica que el pago haya sido registrado correctamente en las cuentas bancarias.`);
        }

        if (compatiblePayments.length > 1) {
          console.warn("⚠️ [AUTO-RECONCILIATION] Multiple payments found, using first one:", compatiblePayments[0]);
        }

        const selectedPayment = compatiblePayments[0];
        console.log("✅ [AUTO-RECONCILIATION] Using existing payment:", selectedPayment);

        // Update sales with reconciliation to existing payment
        const salesIds = group.sales.map(sale => sale.id);
        console.log("📝 [AUTO-RECONCILIATION] Updating sales with IDs:", salesIds);
        console.log("📝 [AUTO-RECONCILIATION] Setting reconciliation_id to:", selectedPayment.id);

        const { error: salesError } = await supabase
          .from("Sales")
          .update({
            reconciliation_id: selectedPayment.id,
            statusPaid: 'cobrado',
            datePaid: group.date
          })
          .in("id", salesIds);

        // Sales update completed

        if (salesError) {
          console.error("❌ [AUTO-RECONCILIATION] Sales update failed:", salesError);
          throw new Error(`Error actualizando ventas: ${salesError.message}`);
        }

        // Update payment reconciliation status
        const { error: paymentUpdateError } = await supabase
          .from("payments")
          .update({
            is_reconciled: true,
            reconciled_amount: group.totalAmount,
            reconciled_count: group.sales.length
          })
          .eq("id", selectedPayment.id);

        if (paymentUpdateError) {
          console.error("❌ [AUTO-RECONCILIATION] Payment update failed:", paymentUpdateError);
          throw new Error(`Error actualizando pago: ${paymentUpdateError.message}`);
        }

        // Payment reconciled successfully

        result.successCount++;
        result.groups.push({ ...group, id: selectedPayment.id });

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
      const result = await createAutomaticPayments(groups);
      return result;
    },
    onSuccess: (result) => {
      
      toast({
        title: "Auto-Reconciliación Completada",
        description: `${result.successCount} grupos procesados exitosamente. ${result.errorCount} errores.`,
      });
      
      console.log("🔄 [AUTO-RECONCILIATION] Invalidating queries...");
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["optimized-payments-reconciliation"] });
      queryClient.invalidateQueries({ queryKey: ["optimized-unreconciled-sales"] });
      queryClient.invalidateQueries({ queryKey: ["optimized-payments"] });
      
      // Reset selection
      setSelectedGroups([]);
      console.log("✅ [AUTO-RECONCILIATION] Process completed successfully");
    },
    onError: (error) => {
      console.error("❌ [AUTO-RECONCILIATION] Mutation failed:", error);
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