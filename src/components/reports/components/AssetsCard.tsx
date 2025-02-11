
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssetsCardProps {
  bankAccounts: number;
  accountsReceivable: number;
  total: number;
  formatAmount: (amount: number) => string;
}

export function AssetsCard({ bankAccounts, accountsReceivable, total, formatAmount }: AssetsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Bancos</span>
            <span className="font-medium">{formatAmount(bankAccounts)}</span>
          </div>
          <div className="flex justify-between">
            <span>Cuentas por Cobrar</span>
            <span className="font-medium">{formatAmount(accountsReceivable)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium">Total Activos</span>
            <span className="font-medium">{formatAmount(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
