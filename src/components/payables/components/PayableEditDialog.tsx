
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PayableForm } from "../PayableForm";
import { PayableFormData } from "../types/payableTypes";
import { AccountPayable } from "@/types/payables";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { dialogLogger } from "@/utils/dialogLogger";
import { parseDateFromDB } from "@/utils/dateUtils";

interface PayableEditDialogProps {
  payable: AccountPayable | null;
  onClose: () => void;
  onSubmit: (id: string, data: PayableFormData, updateSeries?: boolean) => Promise<boolean>;
  isSubmitting: boolean;
}

export function PayableEditDialog({ payable, onClose, onSubmit, isSubmitting }: PayableEditDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(!!payable);
  const [updateSeries, setUpdateSeries] = useState(false);

  useEffect(() => {
    const newDialogState = !!payable;
    setDialogOpen(newDialogState);
    
    if (newDialogState && payable) {
      dialogLogger.logOpen("PayableEditDialog", { payableId: payable.id });
    }
  }, [payable]);

  const handleClose = () => {
    dialogLogger.logClose("PayableEditDialog", { payableId: payable?.id, status: "cancelled" });
    setDialogOpen(false);
    onClose();
  };

  const handleSubmit = async (data: PayableFormData) => {
    if (!payable) return;
    
    const success = await onSubmit(payable.id, data, updateSeries);
    if (success) {
      dialogLogger.logClose("PayableEditDialog", { payableId: payable.id, status: "success" });
      setDialogOpen(false);
      onClose();
    } else {
      dialogLogger.logClose("PayableEditDialog", { payableId: payable.id, status: "error" });
    }
  };

  // Convert the payable to form data format
  const getInitialData = (): PayableFormData | undefined => {
    if (!payable) return undefined;

    // Use parseDateFromDB to avoid timezone issues
    const fixedDueDate = parseDateFromDB(payable.due_date);

    // Create end date if exists
    let endDate = null;
    if (payable.recurrence_end_date) {
      endDate = parseDateFromDB(payable.recurrence_end_date);
    }

    return {
      client_id: payable.client_id || "",
      invoice_id: payable.invoice_id || null,
      amount: payable.amount,
      payment_term: payable.payment_term,
      notes: payable.notes || "",
      due_date: fixedDueDate,
      chart_account_id: payable.chart_account_id || null,
      is_recurring: payable.is_recurring || false,
      recurrence_pattern: payable.recurrence_pattern || null,
      recurrence_day: payable.recurrence_day || null,
      recurrence_end_date: endDate
    };
  };

  // Only show series update option if this is a recurring payable with series_number 0 (the original)
  const showUpdateSeriesOption = 
    payable && 
    payable.is_recurring && 
    (payable.series_number === 0 || payable.series_number === null);

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => {
      if (!open) handleClose();
      setDialogOpen(open);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Cuenta por Pagar</DialogTitle>
        </DialogHeader>
        {payable && (
          <>
            <PayableForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              initialData={getInitialData()}
            />
            
            {showUpdateSeriesOption && (
              <DialogFooter className="mt-4 flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="update_series" 
                    checked={updateSeries}
                    onCheckedChange={(checked) => setUpdateSeries(!!checked)}
                  />
                  <label
                    htmlFor="update_series"
                    className="text-sm text-muted-foreground"
                  >
                    Actualizar todos los pagos futuros en esta serie
                  </label>
                </div>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
