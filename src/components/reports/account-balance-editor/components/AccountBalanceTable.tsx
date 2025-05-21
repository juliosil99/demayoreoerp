
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AccountData {
  id: string;
  code: string;
  name: string;
  account_type: string;
}

interface AccountBalanceTableProps {
  accounts: AccountData[];
  balanceInputs: {[key: string]: string};
  handleInputChange: (accountId: string, value: string) => void;
  handleSaveBalance: (accountId: string) => void;
  isPeriodClosed: boolean;
}

export const AccountBalanceTable: React.FC<AccountBalanceTableProps> = ({
  accounts,
  balanceInputs,
  handleInputChange,
  handleSaveBalance,
  isPeriodClosed
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Cuenta</TableHead>
          <TableHead>Saldo</TableHead>
          <TableHead className="w-[100px]">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4 text-gray-500">
              No hay cuentas en esta categoría
            </TableCell>
          </TableRow>
        ) : (
          accounts.map(account => (
            <TableRow key={account.id}>
              <TableCell>{account.code}</TableCell>
              <TableCell>{account.name}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  disabled={isPeriodClosed}
                  value={balanceInputs[account.id] || '0'}
                  onChange={e => handleInputChange(account.id, e.target.value)}
                  step="0.01"
                />
              </TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isPeriodClosed}
                  onClick={() => handleSaveBalance(account.id)}
                >
                  Guardar
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
