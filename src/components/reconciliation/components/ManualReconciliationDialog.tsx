
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUploader } from "./FileUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency } from "@/utils/formatters";
import { format, parseISO } from 'date-fns';
import { useState } from "react";

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

  const formatExpenseDate = (dateString: string) => {
    try {
      if (!dateString) return "-";
      
      // Parse the ISO date string directly to avoid timezone shifts
      const dateObj = parseISO(dateString);
      return format(dateObj, 'dd/MM/yyyy');
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return dateString || '-';
    }
  };

  const handleFileUploaded = (fileId: string) => {
    setFileId(fileId);
    setIsUploading(false);
  };

  const handleSubmit = () => {
    onConfirm({
      reconciliationType,
      referenceNumber: referenceNumber || undefined,
      notes,
      fileId: fileId,
      chartAccountId: chartAccountId || expense?.chart_account_id,
    });
  };

  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reconciliación Manual</DialogTitle>
          <DialogDescription>
            Gasto: {expense.description} - {formatCurrency(expense.amount)} ({formatExpenseDate(expense.date)})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Tipo de Reconciliación</Label>
            <RadioGroup
              value={reconciliationType}
              onValueChange={setReconciliationType}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no_invoice" id="no_invoice" />
                <Label htmlFor="no_invoice">Sin Factura</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="foreign_invoice" id="foreign_invoice" />
                <Label htmlFor="foreign_invoice">Factura Extranjera</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf_only" id="pdf_only" />
                <Label htmlFor="pdf_only">PDF/Imagen (Sin XML)</Label>
              </div>
            </RadioGroup>
          </div>

          {reconciliationType !== "no_invoice" && (
            <div className="space-y-2">
              <Label htmlFor="reference">Número de Referencia (opcional)</Label>
              <Input
                id="reference"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Número de factura o referencia"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="account">Cuenta Contable</Label>
            <Select
              value={chartAccountId || expense.chart_account_id}
              onValueChange={setChartAccountId}
            >
              <SelectTrigger id="account">
                <SelectValue placeholder="Seleccionar cuenta contable" />
              </SelectTrigger>
              <SelectContent>
                {chartAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas de Reconciliación</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar notas o detalles sobre esta reconciliación"
              rows={3}
            />
          </div>

          {reconciliationType === "pdf_only" && (
            <div className="space-y-2">
              <Label>Subir Documento</Label>
              <FileUploader
                onUploadStart={() => setIsUploading(true)}
                onUploadComplete={handleFileUploaded}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!notes || isUploading || (reconciliationType === "pdf_only" && !fileId)}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
