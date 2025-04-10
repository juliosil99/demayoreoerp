
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FileInputProps {
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function FileInput({ file, onChange, disabled = false }: FileInputProps) {
  return (
    <div>
      <Label htmlFor="file">Archivo</Label>
      <Input
        id="file"
        type="file"
        onChange={onChange}
        accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx,.csv,.doc,.docx"
        className="cursor-pointer"
        disabled={disabled}
      />
      {file && (
        <p className="text-xs text-muted-foreground mt-1">
          {file.name} ({Math.round(file.size / 1024)} KB)
        </p>
      )}
    </div>
  );
}
