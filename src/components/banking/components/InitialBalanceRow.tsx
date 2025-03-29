
import { BankAccount } from "@/components/banking/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";

interface InitialBalanceRowProps {
  account: BankAccount;
}

// This component is kept for backward compatibility but is no longer used
// The initial balance row is now handled directly in TransactionRow
export function InitialBalanceRow({ account }: InitialBalanceRowProps) {
  return (
    <TableRow className="bg-muted/20 font-medium">
      <TableCell>{formatDate(account.balance_date)}</TableCell>
      <TableCell>Saldo Inicial</TableCell>
      <TableCell>-</TableCell>
      <TableCell className="text-right">-</TableCell>
      <TableCell className="text-right">{formatCurrency(account.initial_balance || 0)}</TableCell>
      <TableCell className="text-right">{formatCurrency(account.initial_balance || 0)}</TableCell>
    </TableRow>
  );
}
