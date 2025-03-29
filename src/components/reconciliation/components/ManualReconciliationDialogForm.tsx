
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { ReconciliationTypeSelector } from "./dialog-sections/ReconciliationTypeSelector";
import { ReferenceNumberField } from "./dialog-sections/ReferenceNumberField";
import { ChartAccountSelector } from "./dialog-sections/ChartAccountSelector";
import { NotesField } from "./dialog-sections/NotesField";
import { FileUploadSection } from "./dialog-sections/FileUploadSection";
import { useManualReconciliationForm } from "../hooks/useManualReconciliationForm";

interface ManualReconciliationDialogFormProps {
  expense: any | null;
  onConfirm: (data: {
    reconciliationType: string;
    referenceNumber?: string;
    notes: string;
    fileId?: string;
    chartAccountId?: string;
  }) => void;
  onOpenChange: (open: boolean) => void;
  chartAccounts: { id: string; name: string; code: string }[];
}

export function ManualReconciliationDialogForm({
  expense,
  onConfirm,
  onOpenChange,
  chartAccounts,
}: ManualReconciliationDialogFormProps) {
  const {
    formState,
    setReconciliationType,
    setReferenceNumber,
    setNotes,
    setChartAccountId,
    setIsUploading,
    handleFileUploaded,
    handleSubmit,
    isSubmitDisabled,
    confirmDisabled
  } = useManualReconciliationForm({
    expense,
    onConfirm,
    onOpenChange
  });

  if (!expense) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <ReconciliationTypeSelector 
        value={formState.reconciliationType}
        onChange={(value) => {
          console.log("[ManualReconciliationDialog] Reconciliation type changed to:", value);
          setReconciliationType(value);
        }}
      />

      {formState.reconciliationType !== "no_invoice" && (
        <ReferenceNumberField
          value={formState.referenceNumber}
          onChange={(value) => {
            console.log("[ManualReconciliationDialog] Reference number changed to:", value);
            setReferenceNumber(value);
          }}
        />
      )}

      <ChartAccountSelector
        value={formState.chartAccountId}
        accounts={chartAccounts}
        onChange={(value) => {
          console.log("[ManualReconciliationDialog] Chart account changed to:", value);
          setChartAccountId(value);
        }}
        defaultAccountId={expense?.chart_account_id}
      />

      <NotesField
        value={formState.notes}
        onChange={(value) => {
          console.log("[ManualReconciliationDialog] Notes changed to:", value.substring(0, 20) + (value.length > 20 ? "..." : ""));
          setNotes(value);
        }}
      />

      {formState.reconciliationType === "pdf_only" && (
        <FileUploadSection
          onUploadStart={() => {
            console.log("[ManualReconciliationDialog] File upload started");
            setIsUploading(true);
          }}
          onUploadComplete={handleFileUploaded}
        />
      )}

      <DialogFooter>
        <Button 
          type="button"
          variant="outline" 
          onClick={() => {
            console.log("[ManualReconciliationDialog] Cancel button clicked");
            onOpenChange(false);
          }}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            console.log("[ManualReconciliationDialog] Confirm button clicked manually, disabled:", isSubmitDisabled);
            handleSubmit(e);
          }} 
          disabled={isSubmitDisabled}
        >
          {confirmDisabled ? "Procesando..." : "Confirmar"}
        </Button>
      </DialogFooter>
    </form>
  );
}
