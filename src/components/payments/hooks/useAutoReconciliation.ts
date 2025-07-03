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
      console.log("🔍 [AUTO-RECONCILIATION DEBUG] Starting detection process...");
      
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

      console.log("💰 [SALES] Unreconciled sales found:", sales);
      console.log("💰 [SALES_COUNT] Total unreconciled sales:", sales?.length || 0);

      if (!sales || sales.length === 0) {
        console.log("❌ [SALES] No unreconciled sales found");
        return [];
      }

      // Log specific sales for June 23rd JM208
      const june23JM208 = sales.filter(s => s.date === '2025-06-23' && s.Channel === 'JM208');
      console.log("🎯 [TARGET_SALES] June 23rd JM208 sales:", june23JM208);

      // Group sales by date, payment method, and channel
      const groupsMap = new Map<string, UnreconciledSale[]>();
      
      sales.forEach(sale => {
        const key = `${sale.date}-${sale.payment_method}-${sale.Channel}`;
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
        
        const [date, paymentMethod, channel] = key.split('-');
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