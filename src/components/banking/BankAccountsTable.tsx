
import { BanknoteIcon, CreditCard, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";

type AccountType = "Bank" | "Cash" | "Credit Card" | "Credit Simple";

interface BankAccount {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
  created_at: string;
  chart_of_accounts?: {
    code: string;
    name: string;
  };
}

interface BankAccountsTableProps {
  accounts: BankAccount[];
  onEdit: (account: BankAccount) => void;
  onDelete: (account: BankAccount) => void;
}

export function BankAccountsTable({ accounts, onEdit, onDelete }: BankAccountsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre de la Cuenta</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Cuenta Contable</TableHead>
            <TableHead className="text-right">Saldo Actual</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts?.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-medium">{account.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {account.type === "Credit Card" ? (
                    <CreditCard className="h-4 w-4" />
                  ) : (
                    <BanknoteIcon className="h-4 w-4" />
                  )}
                  {account.type === "Bank" ? "Banco" :
                   account.type === "Cash" ? "Efectivo" :
                   account.type === "Credit Card" ? "Tarjeta de Crédito" :
                   "Crédito Simple"}
                </div>
              </TableCell>
              <TableCell>
                {account.chart_of_accounts ? 
                  `${account.chart_of_accounts.code} - ${account.chart_of_accounts.name}` : 
                  "No asignada"}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(account.balance)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(account)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(account)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
