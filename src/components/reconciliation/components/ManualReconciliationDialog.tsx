
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useState } from "react";
import { FileUploader } from "./FileUploader";

interface ManualReconciliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: any;
  onConfirm: (data: {
    reconciliationType: string;
    referenceNumber?: string;
    notes: string;
    fileId?: string;
    chartAccountId?: string;
  }) => void;
  chartAccounts: any[];
}

export function ManualReconciliationDialog({
  open,
  onOpenChange,
  expense,
  onConfirm,
  chartAccounts
}: ManualReconciliationDialogProps) {
  const [reconciliationType, setReconciliationType] = useState<string>("no_invoice");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [fileId, setFileId] = useState<string>("");
  const [chartAccountId, setChartAccountId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = () => {
    setIsSubmitting(true);
    onConfirm({
      reconciliationType,
      referenceNumber,
      notes,
      fileId: fileId || undefined,
      chartAccountId: chartAccountId || undefined
    });
    setIsSubmitting(false);
  };

  const handleFileUpload = (id: string) => {
    setFileId(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reconciliación Manual</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="reconciliationType">Tipo de Reconciliación</Label>
            <Select 
              value={reconciliationType} 
              onValueChange={setReconciliationType}
            >
              <SelectTrigger id="reconciliationType">
                <SelectValue placeholder="Seleccione un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_invoice">Sin Factura</SelectItem>
                <SelectItem value="foreign_invoice">Factura Extranjera</SelectItem>
                <SelectItem value="pdf_upload">Subir PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reconciliationType === "pdf_upload" && (
            <div>
              <Label>Subir Factura (PDF)</Label>
              <FileUploader onUploadSuccess={handleFileUpload} />
            </div>
          )}

          <div>
            <Label htmlFor="referenceNumber">Número de Referencia</Label>
            <Input 
              id="referenceNumber" 
              value={referenceNumber} 
              onChange={(e) => setReferenceNumber(e.target.value)} 
              placeholder="Referencia (opcional)"
            />
          </div>

          {reconciliationType !== "no_invoice" && (
            <div>
              <Label htmlFor="chartAccount">Cuenta Contable</Label>
              <Select 
                value={chartAccountId} 
                onValueChange={setChartAccountId}
              >
                <SelectTrigger id="chartAccount">
                  <SelectValue placeholder="Seleccione cuenta contable" />
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
          )}

          <div>
            <Label htmlFor="notes">Notas / Justificación</Label>
            <Textarea 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Razón por la que se hace reconciliación manual"
              className="h-24"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isSubmitting || (!notes)}
          >
            Confirmar Reconciliación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
