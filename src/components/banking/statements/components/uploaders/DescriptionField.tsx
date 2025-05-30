
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DescriptionFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

export function DescriptionField({ value, onChange, disabled = false }: DescriptionFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="description" className="font-medium">Descripción (opcional)</Label>
      <Textarea
        id="description"
        value={value}
        onChange={onChange}
        placeholder="Agrega una descripción opcional para este estado de cuenta"
        rows={3}
        disabled={disabled}
        className="resize-none"
      />
    </div>
  );
}
