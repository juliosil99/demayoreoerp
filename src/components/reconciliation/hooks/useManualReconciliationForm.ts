
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ManualReconciliationFormState {
  reconciliationType: string;
  referenceNumber: string;
  notes: string;
  fileId?: string;
  chartAccountId?: string;
}

interface UseManualReconciliationFormProps {
  expense: any | null;
  onConfirm: (data: {
    reconciliationType: string;
    referenceNumber?: string;
    notes: string;
    fileId?: string;
    chartAccountId?: string;
  }) => void;
  onOpenChange: (open: boolean) => void;
}

export function useManualReconciliationForm({
  expense,
  onConfirm,
  onOpenChange,
}: UseManualReconciliationFormProps) {
  const [reconciliationType, setReconciliationType] = useState("no_invoice");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [fileId, setFileId] = useState<string | undefined>(undefined);
  const [chartAccountId, setChartAccountId] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDisabled, setConfirmDisabled] = useState(false);

  // Reset form state when dialog opens
  useEffect(() => {
    if (expense) {
      console.log("[ManualReconciliationForm] Setting form for expense:", expense.id);
      setReconciliationType("no_invoice");
      setReferenceNumber("");
      setNotes("");
      setFileId(undefined);
      setIsUploading(false);
      setConfirmDisabled(false);
      if (expense.chart_account_id) {
        console.log("[ManualReconciliationForm] Setting initial chart account ID to:", expense.chart_account_id);
        setChartAccountId(expense.chart_account_id);
      } else {
        setChartAccountId(undefined);
      }
    } else {
      console.log("[ManualReconciliationForm] No expense provided");
    }
  }, [expense]);

  const handleFileUploaded = (fileId: string) => {
    console.log("[ManualReconciliationForm] File uploaded, received ID:", fileId);
    setFileId(fileId);
    setIsUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log("[ManualReconciliationForm] Submit handler called, confirmDisabled:", confirmDisabled);
    
    if (confirmDisabled) {
      console.log("[ManualReconciliationForm] Submit button is disabled, ignoring click");
      return;
    }
    
    if (reconciliationType === "pdf_only" && !fileId) {
      console.log("[ManualReconciliationForm] Cannot submit: 'pdf_only' selected but no file uploaded");
      toast.error("Por favor suba un archivo PDF");
      return;
    }
    
    if (!notes || notes.trim() === "") {
      console.log("[ManualReconciliationForm] Cannot submit: Notes field is empty");
      toast.error("Por favor agregue notas");
      return;
    }
    
    console.log("[ManualReconciliationForm] Submit button clicked - preparing reconciliation data");
    setConfirmDisabled(true);
    
    const reconciliationData = {
      reconciliationType,
      referenceNumber: referenceNumber || undefined,
      notes,
      fileId,
      chartAccountId: chartAccountId || expense?.chart_account_id,
    };
    
    console.log("[ManualReconciliationForm] Submitting reconciliation data:", JSON.stringify(reconciliationData, null, 2));
    
    try {
      onConfirm(reconciliationData);
      console.log("[ManualReconciliationForm] onConfirm handler called successfully");
      
      setTimeout(() => {
        console.log("[ManualReconciliationForm] Forcing dialog close...");
        onOpenChange(false);
      }, 300);
    } catch (error) {
      console.error("[ManualReconciliationForm] Error in onConfirm handler:", error);
      setConfirmDisabled(false);
      toast.error("Error al procesar la reconciliación");
    }
  };

  const isSubmitDisabled = !notes || 
    isUploading || 
    (reconciliationType === "pdf_only" && !fileId) || 
    confirmDisabled;

  return {
    formState: {
      reconciliationType,
      referenceNumber,
      notes,
      fileId,
      chartAccountId,
    },
    setReconciliationType,
    setReferenceNumber,
    setNotes,
    setChartAccountId,
    isUploading,
    setIsUploading,
    handleFileUploaded,
    handleSubmit,
    isSubmitDisabled,
    confirmDisabled
  };
}
