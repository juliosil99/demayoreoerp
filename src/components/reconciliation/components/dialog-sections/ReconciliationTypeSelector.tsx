
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ReconciliationTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ReconciliationTypeSelector({ 
  value, 
  onChange 
}: ReconciliationTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Tipo de Reconciliación</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
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
  );
}
