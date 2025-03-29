
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface NotesFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function NotesField({ 
  value, 
  onChange 
}: NotesFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notas de Reconciliación</Label>
      <Textarea
        id="notes"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Agregar notas o detalles sobre esta reconciliación"
        rows={3}
      />
    </div>
  );
}
