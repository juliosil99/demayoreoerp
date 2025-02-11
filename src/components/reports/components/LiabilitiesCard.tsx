
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LiabilitiesCardProps {
  accountsPayable: number;
  total: number;
  formatAmount: (amount: number) => string;
}

export function LiabilitiesCard({ accountsPayable, total, formatAmount }: LiabilitiesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pasivos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Cuentas por Pagar</span>
            <span className="font-medium">{formatAmount(accountsPayable)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium">Total Pasivos</span>
            <span className="font-medium">{formatAmount(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
