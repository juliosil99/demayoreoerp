
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
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";
import type { NewBankAccount, BankAccount, AccountCurrency } from "./types";
import { useForm } from "react-hook-form";

interface BankAccountDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (account: NewBankAccount | BankAccount) => void;
  account: NewBankAccount;
  setAccount: (account: NewBankAccount) => void;
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
}: BankAccountDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre de la Cuenta</Label>
            <Input
              id="name"
              value={account.name}
              onChange={(e) =>
                setAccount({ ...account, name: e.target.value })
              }
              placeholder="Ingrese el nombre de la cuenta"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Tipo de Cuenta</Label>
            <Select
              value={account.type}
              onValueChange={(value) =>
                setAccount({ ...account, type: value as NewBankAccount["type"] })
              }
            >
              <SelectTrigger id="type">
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
            <Label htmlFor="currency">Moneda</Label>
            <Select
              value={account.currency}
              onValueChange={(value) =>
                setAccount({ ...account, currency: value as AccountCurrency })
              }
            >
              <SelectTrigger id="currency">
                <SelectValue placeholder="Seleccione la moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="initial_balance">Saldo Inicial</Label>
              <Input
                id="initial_balance"
                type="number"
                value={account.initial_balance}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    initial_balance: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="balance_date">Fecha del Saldo</Label>
              <Input
                id="balance_date"
                type="date"
                value={account.balance_date ? account.balance_date.split('T')[0] : ''}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    balance_date: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="balance">Saldo Actual</Label>
            <Input
              id="balance"
              type="number"
              value={account.balance}
              onChange={(e) =>
                setAccount({
                  ...account,
                  balance: parseFloat(e.target.value) || 0,
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
            onClick={() => onSave(account)}
            className="w-full sm:w-auto"
          >
            {submitText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
