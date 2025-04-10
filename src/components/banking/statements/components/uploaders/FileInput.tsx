
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FileInputProps {
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function FileInput({ file, onChange, disabled = false }: FileInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="file" className="font-medium">Archivo</Label>
      <div className="border border-input rounded-md focus-within:ring-1 focus-within:ring-primary">
        <Input
          id="file"
          type="file"
          onChange={onChange}
          accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx,.csv,.doc,.docx"
          className="cursor-pointer bg-background file:border-0 file:bg-transparent file:text-primary file:font-medium file:mr-2"
          disabled={disabled}
        />
      </div>
      {file && (
        <p className="text-xs text-muted-foreground mt-1">
          {file.name} ({Math.round(file.size / 1024)} KB)
        </p>
      )}
    </div>
  );
}
