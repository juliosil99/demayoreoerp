
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
      <CardHeader className="py-3 sm:py-4">
        <CardTitle className="text-sm sm:text-base">Activos</CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-3 sm:p-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs sm:text-sm">Bancos</span>
            <span className="font-medium text-xs sm:text-sm">{formatAmount(bankAccounts)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs sm:text-sm">Cuentas por Cobrar</span>
            <span className="font-medium text-xs sm:text-sm">{formatAmount(accountsReceivable)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium text-xs sm:text-sm">Total Activos</span>
            <span className="font-medium text-xs sm:text-sm">{formatAmount(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
