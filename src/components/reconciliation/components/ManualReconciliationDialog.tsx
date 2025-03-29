
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatCardDate } from "@/utils/formatters";
import { useState, useEffect } from "react";
import { ReconciliationTypeSelector } from "./dialog-sections/ReconciliationTypeSelector";
import { ReferenceNumberField } from "./dialog-sections/ReferenceNumberField";
import { ChartAccountSelector } from "./dialog-sections/ChartAccountSelector";
import { NotesField } from "./dialog-sections/NotesField";
import { FileUploadSection } from "./dialog-sections/FileUploadSection";

interface ManualReconciliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: any | null;
  onConfirm: (data: {
    reconciliationType: string;
    referenceNumber?: string;
    notes: string;
    fileId?: string;
    chartAccountId?: string;
  }) => void;
  chartAccounts: { id: string; name: string; code: string }[];
}

export function ManualReconciliationDialog({
  open,
  onOpenChange,
  expense,
  onConfirm,
  chartAccounts,
}: ManualReconciliationDialogProps) {
  const [reconciliationType, setReconciliationType] = useState("no_invoice");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [fileId, setFileId] = useState<string | undefined>(undefined);
  const [chartAccountId, setChartAccountId] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDisabled, setConfirmDisabled] = useState(false);

  // Reset form state when dialog opens/closes
  useEffect(() => {
    if (open) {
      console.log("ManualReconciliationDialog opened for expense:", expense?.id);
      // Initialize with defaults when opening
      setReconciliationType("no_invoice");
      setReferenceNumber("");
      setNotes("");
      setFileId(undefined);
      setIsUploading(false);
      setConfirmDisabled(false);
      // Set chart account to the expense's chart account if available
      if (expense?.chart_account_id) {
        console.log("Setting initial chart account ID to:", expense.chart_account_id);
        setChartAccountId(expense.chart_account_id);
      } else {
        setChartAccountId(undefined);
      }
    }
  }, [open, expense]);

  const handleFileUploaded = (fileId: string) => {
    console.log("File uploaded, received ID:", fileId);
    setFileId(fileId);
    setIsUploading(false);
  };

  const handleSubmit = () => {
    if (confirmDisabled) return;
    
    console.log("Manual reconciliation submit button clicked");
    setConfirmDisabled(true);
    
    const reconciliationData = {
      reconciliationType,
      referenceNumber: referenceNumber || undefined,
      notes,
      fileId,
      chartAccountId: chartAccountId || expense?.chart_account_id,
    };
    
    console.log("Submitting manual reconciliation with data:", reconciliationData);
    
    // Call the onConfirm callback with the form data
    onConfirm(reconciliationData);
    
    // Close the dialog after submission
    setTimeout(() => {
      console.log("Manually closing dialog after submission");
      onOpenChange(false);
    }, 100);
  };

  if (!expense) return null;

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        console.log("Dialog onOpenChange called with value:", newOpen);
        if (isUploading) {
          console.log("Preventing dialog close during file upload");
          return;
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reconciliación Manual</DialogTitle>
          <DialogDescription>
            Gasto: {expense.description} - {formatCurrency(expense.amount)} ({formatCardDate(expense.date)})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <ReconciliationTypeSelector 
            value={reconciliationType}
            onChange={setReconciliationType}
          />

          {reconciliationType !== "no_invoice" && (
            <ReferenceNumberField
              value={referenceNumber}
              onChange={setReferenceNumber}
            />
          )}

          <ChartAccountSelector
            value={chartAccountId}
            accounts={chartAccounts}
            onChange={setChartAccountId}
            defaultAccountId={expense?.chart_account_id}
          />

          <NotesField
            value={notes}
            onChange={setNotes}
          />

          {reconciliationType === "pdf_only" && (
            <FileUploadSection
              onUploadStart={() => {
                console.log("File upload started");
                setIsUploading(true);
              }}
              onUploadComplete={handleFileUploaded}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!notes || isUploading || (reconciliationType === "pdf_only" && !fileId) || confirmDisabled}
          >
            {confirmDisabled ? "Procesando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
