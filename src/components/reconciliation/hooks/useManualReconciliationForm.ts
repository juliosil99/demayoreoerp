
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
      setReconciliationType("no_invoice");
      setReferenceNumber("");
      setNotes("");
      setFileId(undefined);
      setIsUploading(false);
      setConfirmDisabled(false);
      if (expense.chart_account_id) {
        setChartAccountId(expense.chart_account_id);
      } else {
        setChartAccountId(undefined);
      }
    }
  }, [expense]);

  const handleFileUploaded = (fileId: string) => {
    setFileId(fileId);
    setIsUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (confirmDisabled) {
      return;
    }
    
    if (reconciliationType === "pdf_only" && !fileId) {
      toast.error("Por favor suba un archivo PDF");
      return;
    }
    
    if (!notes || notes.trim() === "") {
      toast.error("Por favor agregue notas");
      return;
    }
    
    setConfirmDisabled(true);
    
    const reconciliationData = {
      reconciliationType,
      referenceNumber: referenceNumber || undefined,
      notes,
      fileId,
      chartAccountId: chartAccountId || expense?.chart_account_id,
    };
    
    try {
      onConfirm(reconciliationData);
      
      setTimeout(() => {
        onOpenChange(false);
      }, 300);
    } catch (error) {
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
