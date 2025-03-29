
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ChartAccount {
  id: string;
  name: string;
  code: string;
}

interface ChartAccountSelectorProps {
  value: string | undefined;
  accounts: ChartAccount[];
  onChange: (value: string) => void;
  defaultAccountId?: string;
}

export function ChartAccountSelector({ 
  value, 
  accounts, 
  onChange,
  defaultAccountId
}: ChartAccountSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="account">Cuenta Contable</Label>
      <Select
        value={value || defaultAccountId}
        onValueChange={(value) => {
          console.log("Chart account changed to:", value);
          onChange(value);
        }}
      >
        <SelectTrigger id="account">
          <SelectValue placeholder="Seleccionar cuenta contable" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.code} - {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
