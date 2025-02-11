
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EquityCardProps {
  netIncome: number;
  total: number;
  formatAmount: (amount: number) => string;
}

export function EquityCard({ netIncome, total, formatAmount }: EquityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Capital</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Resultado del Periodo</span>
            <span className="font-medium">{formatAmount(netIncome)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium">Total Capital</span>
            <span className="font-medium">{formatAmount(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
