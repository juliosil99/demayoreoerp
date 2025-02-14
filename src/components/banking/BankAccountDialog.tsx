
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AccountType = "Bank" | "Cash" | "Credit Card" | "Credit Simple";

interface BankAccount {
  name: string;
  type: AccountType;
  balance: number;
  chart_account_id: string;
}

interface BankAccountDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  account: BankAccount;
  setAccount: (account: BankAccount) => void;
  title: string;
  submitText: string;
  chartAccounts: any[];
}

export function BankAccountDialog({
  isOpen,
  onOpenChange,
  onSave,
  account,
  setAccount,
  title,
  submitText,
  chartAccounts,
}: BankAccountDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label>Nombre de la Cuenta</label>
            <Input
              value={account.name}
              onChange={(e) =>
                setAccount({ ...account, name: e.target.value })
              }
              placeholder="Ingrese el nombre de la cuenta"
            />
          </div>
          <div className="grid gap-2">
            <label>Tipo de Cuenta</label>
            <Select
              value={account.type}
              onValueChange={(value) =>
                setAccount({ ...account, type: value as AccountType })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo de cuenta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bank">Banco</SelectItem>
                <SelectItem value="Cash">Efectivo</SelectItem>
                <SelectItem value="Credit Card">Tarjeta de Crédito</SelectItem>
                <SelectItem value="Credit Simple">Crédito Simple</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label>Cuenta Contable</label>
            <Select
              value={account.chart_account_id}
              onValueChange={(value) =>
                setAccount({ ...account, chart_account_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione la cuenta contable" />
              </SelectTrigger>
              <SelectContent>
                {chartAccounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label>Saldo</label>
            <Input
              type="number"
              value={account.balance}
              onChange={(e) =>
                setAccount({
                  ...account,
                  balance: parseFloat(e.target.value),
                })
              }
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onSave}
            className="w-full sm:w-auto"
          >
            {submitText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
