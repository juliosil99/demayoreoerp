
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LiabilitiesCardProps {
  accountsPayable: number;
  total: number;
  formatAmount: (amount: number) => string;
}

export function LiabilitiesCard({ accountsPayable, total, formatAmount }: LiabilitiesCardProps) {
  return (
    <Card>
      <CardHeader className="py-3 sm:py-4">
        <CardTitle className="text-sm sm:text-base">Pasivos</CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-3 sm:p-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs sm:text-sm">Cuentas por Pagar</span>
            <span className="font-medium text-xs sm:text-sm">{formatAmount(accountsPayable)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium text-xs sm:text-sm">Total Pasivos</span>
            <span className="font-medium text-xs sm:text-sm">{formatAmount(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
