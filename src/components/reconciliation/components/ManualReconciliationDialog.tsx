
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
      console.log("[ManualReconciliationDialog] Dialog opened for expense:", expense?.id);
      // Initialize with defaults when opening
      setReconciliationType("no_invoice");
      setReferenceNumber("");
      setNotes("");
      setFileId(undefined);
      setIsUploading(false);
      setConfirmDisabled(false);
      // Set chart account to the expense's chart account if available
      if (expense?.chart_account_id) {
        console.log("[ManualReconciliationDialog] Setting initial chart account ID to:", expense.chart_account_id);
        setChartAccountId(expense.chart_account_id);
      } else {
        setChartAccountId(undefined);
      }
    } else {
      console.log("[ManualReconciliationDialog] Dialog closed or not open");
    }
  }, [open, expense]);

  const handleFileUploaded = (fileId: string) => {
    console.log("[ManualReconciliationDialog] File uploaded, received ID:", fileId);
    setFileId(fileId);
    setIsUploading(false);
  };

  const handleSubmit = () => {
    if (confirmDisabled) {
      console.log("[ManualReconciliationDialog] Submit button is disabled, ignoring click");
      return;
    }
    
    console.log("[ManualReconciliationDialog] Submit button clicked - preparing reconciliation data");
    setConfirmDisabled(true);
    
    const reconciliationData = {
      reconciliationType,
      referenceNumber: referenceNumber || undefined,
      notes,
      fileId,
      chartAccountId: chartAccountId || expense?.chart_account_id,
    };
    
    console.log("[ManualReconciliationDialog] Submitting reconciliation data:", JSON.stringify(reconciliationData, null, 2));
    
    try {
      // Call the onConfirm callback with the form data
      onConfirm(reconciliationData);
      console.log("[ManualReconciliationDialog] onConfirm handler called successfully");
    } catch (error) {
      console.error("[ManualReconciliationDialog] Error in onConfirm handler:", error);
      setConfirmDisabled(false);
    }
    
    // Force close the dialog after submission
    console.log("[ManualReconciliationDialog] Forcing dialog close...");
    setTimeout(() => {
      console.log("[ManualReconciliationDialog] Calling onOpenChange(false) to close dialog");
      onOpenChange(false);
    }, 100);
  };

  if (!expense) return null;

  const isSubmitDisabled = !notes || 
    isUploading || 
    (reconciliationType === "pdf_only" && !fileId) || 
    confirmDisabled;

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        console.log(`[ManualReconciliationDialog] Dialog onOpenChange triggered with value: ${newOpen}`);
        if (isUploading) {
          console.log("[ManualReconciliationDialog] Preventing dialog close during file upload");
          return;
        }
        console.log("[ManualReconciliationDialog] Setting manual reconciliation dialog open state to:", newOpen);
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
            onChange={(value) => {
              console.log("[ManualReconciliationDialog] Reconciliation type changed to:", value);
              setReconciliationType(value);
            }}
          />

          {reconciliationType !== "no_invoice" && (
            <ReferenceNumberField
              value={referenceNumber}
              onChange={(value) => {
                console.log("[ManualReconciliationDialog] Reference number changed to:", value);
                setReferenceNumber(value);
              }}
            />
          )}

          <ChartAccountSelector
            value={chartAccountId}
            accounts={chartAccounts}
            onChange={(value) => {
              console.log("[ManualReconciliationDialog] Chart account changed to:", value);
              setChartAccountId(value);
            }}
            defaultAccountId={expense?.chart_account_id}
          />

          <NotesField
            value={notes}
            onChange={(value) => {
              console.log("[ManualReconciliationDialog] Notes changed to:", value.substring(0, 20) + (value.length > 20 ? "..." : ""));
              setNotes(value);
            }}
          />

          {reconciliationType === "pdf_only" && (
            <FileUploadSection
              onUploadStart={() => {
                console.log("[ManualReconciliationDialog] File upload started");
                setIsUploading(true);
              }}
              onUploadComplete={handleFileUploaded}
            />
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              console.log("[ManualReconciliationDialog] Cancel button clicked");
              onOpenChange(false);
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              console.log("[ManualReconciliationDialog] Confirm button clicked, disabled:", isSubmitDisabled);
              handleSubmit();
            }} 
            disabled={isSubmitDisabled}
          >
            {confirmDisabled ? "Procesando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
