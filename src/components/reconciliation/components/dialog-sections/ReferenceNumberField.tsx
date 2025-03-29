
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReferenceNumberFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ReferenceNumberField({ 
  value, 
  onChange 
}: ReferenceNumberFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="reference">Número de Referencia (opcional)</Label>
      <Input
        id="reference"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Número de factura o referencia"
      />
    </div>
  );
}
