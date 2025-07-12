
import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { TransferFormData } from "../transfer-form/types";
import { uploadTransferInvoice, deleteTransferInvoice } from "../utils/transferInvoiceUtils";
import { useAuth } from "@/contexts/AuthContext";

interface Transfer {
  id: string;
  date: string;
  from_account_id: number;
  to_account_id: number;
  amount_from?: number;
  amount_to?: number;
  amount?: number; // For backward compatibility
  exchange_rate?: number;
  reference_number?: string;
  notes?: string;
  invoice_file_path?: string;
  invoice_filename?: string;
  invoice_content_type?: string;
  invoice_size?: number;
  selected_invoice_id?: number;
}

export function useTransferEdit(
  transfer: Transfer | null,
  onClose: () => void
) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TransferFormData>({
    date: "",
    from_account_id: "",
    to_account_id: "",
    amount_from: "",
    amount_to: "",
    exchange_rate: "1",
    reference_number: "",
    notes: "",
    selected_invoice_id: undefined,
  });

  useEffect(() => {
    if (transfer) {
      // Handle both new format (amount_from/amount_to) and old format (amount)
      const amountFrom = transfer.amount_from !== undefined ? transfer.amount_from : transfer.amount || 0;
      const amountTo = transfer.amount_to !== undefined ? transfer.amount_to : transfer.amount || 0;
      const exchangeRate = transfer.exchange_rate || 1;

      setFormData({
        date: format(new Date(transfer.date), "yyyy-MM-dd"),
        from_account_id: String(transfer.from_account_id),
        to_account_id: String(transfer.to_account_id),
        amount_from: String(amountFrom),
        amount_to: String(amountTo),
        exchange_rate: String(exchangeRate),
        reference_number: transfer.reference_number || "",
        notes: transfer.notes || "",
        invoice_file_path: transfer.invoice_file_path || undefined,
        invoice_filename: transfer.invoice_filename || undefined,
        selected_invoice_id: transfer.selected_invoice_id || undefined,
      });
    }
  }, [transfer]);

  const updateTransfer = useMutation({
    mutationFn: async () => {
      if (!transfer) return;

      // Handle new invoice upload
      let invoiceData = {};
      if (formData.invoice_file && user?.id) {
        // Delete old invoice if exists
        if (transfer.invoice_file_path) {
          try {
            await deleteTransferInvoice(transfer.invoice_file_path);
          } catch (error) {
            console.warn('Failed to delete old invoice:', error);
          }
        }

        // Upload new invoice
        const uploadResult = await uploadTransferInvoice(formData.invoice_file, user.id);
        if (uploadResult) {
          invoiceData = {
            invoice_file_path: uploadResult.path,
            invoice_filename: uploadResult.filename,
            invoice_content_type: uploadResult.contentType,
            invoice_size: uploadResult.size
          };
        }
      } else if (!formData.invoice_filename && transfer.invoice_file_path) {
        // User removed the invoice
        try {
          await deleteTransferInvoice(transfer.invoice_file_path);
        } catch (error) {
          console.warn('Failed to delete invoice:', error);
        }
        invoiceData = {
          invoice_file_path: null,
          invoice_filename: null,
          invoice_content_type: null,
          invoice_size: null
        };
      }

      const { error } = await supabase
        .from("account_transfers")
        .update({
          date: formData.date,
          from_account_id: parseInt(formData.from_account_id),
          to_account_id: parseInt(formData.to_account_id),
          amount_from: parseFloat(formData.amount_from),
          amount_to: parseFloat(formData.amount_to || formData.amount_from),
          exchange_rate: parseFloat(formData.exchange_rate || "1"),
          reference_number: formData.reference_number || null,
          notes: formData.notes || null,
          // For backward compatibility, also update the amount field
          amount: parseFloat(formData.amount_from),
          selected_invoice_id: formData.selected_invoice_id || null,
          ...invoiceData
        })
        .eq("id", transfer.id);

      if (error) throw error;

      // Handle invoice selection changes
      const previousInvoiceId = transfer.selected_invoice_id;
      const currentInvoiceId = formData.selected_invoice_id;

      // If previous invoice exists and current is different, mark previous as unprocessed
      if (previousInvoiceId && previousInvoiceId !== currentInvoiceId) {
        await supabase
          .from("invoices")
          .update({ processed: false })
          .eq("id", previousInvoiceId);
      }

      // If current invoice exists and is different from previous, mark as processed
      if (currentInvoiceId && currentInvoiceId !== previousInvoiceId) {
        await supabase
          .from("invoices")
          .update({ processed: true })
          .eq("id", currentInvoiceId);
      }
    },
    onSuccess: () => {
      toast.success("Transferencia actualizada con éxito");
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["account-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["available-invoices"] });
      onClose();
    },
    onError: (error) => {
      toast.error("Error al actualizar la transferencia: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.from_account_id === formData.to_account_id) {
      toast.error("Las cuentas de origen y destino deben ser diferentes");
      return;
    }
    
    if (!formData.amount_from || parseFloat(formData.amount_from) <= 0) {
      toast.error("El monto debe ser mayor que cero");
      return;
    }
    
    if (!formData.amount_to || parseFloat(formData.amount_to) <= 0) {
      toast.error("El monto de destino debe ser mayor que cero");
      return;
    }
    
    updateTransfer.mutate();
  };

  return {
    formData,
    setFormData,
    handleSubmit,
    isPending: updateTransfer.isPending,
  };
}
