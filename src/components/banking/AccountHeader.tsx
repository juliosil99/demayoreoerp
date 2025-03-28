
import { formatCurrency, formatDate } from "@/utils/formatters";
import { BankAccount } from "@/components/banking/types";

interface AccountHeaderProps {
  account: BankAccount;
}

export function AccountHeader({ account }: AccountHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">Movimientos de Cuenta</h1>
      <h2 className="text-xl">{account.name}</h2>
      <div className="flex flex-col md:flex-row md:gap-4">
        <p className="text-muted-foreground">
          <span className="font-medium">Saldo actual:</span> {formatCurrency(account.balance)}
        </p>
        <p className="text-muted-foreground">
          <span className="font-medium">Saldo inicial:</span> {formatCurrency(account.initial_balance)} 
          <span className="ml-1">(desde {formatDate(account.balance_date)})</span>
        </p>
      </div>
    </div>
  );
}
