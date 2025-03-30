
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
      <Label htmlFor="notes" className="flex items-center">
        Notas de Reconciliación <span className="text-red-500 ml-1">*</span>
        <span className="text-xs text-muted-foreground ml-2">(Campo obligatorio)</span>
      </Label>
      <Textarea
        id="notes"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Agregar notas o detalles sobre esta reconciliación"
        rows={3}
        className={value === "" ? "border-red-300 focus-visible:ring-red-500" : ""}
        required
      />
    </div>
  );
}
