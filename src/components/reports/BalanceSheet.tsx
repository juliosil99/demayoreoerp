
import * as React from "react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { fetchBalanceSheetData, type BalanceSheetData } from "./utils/balance-sheet-queries";
import { AssetsCard } from "./components/AssetsCard";
import { LiabilitiesCard } from "./components/LiabilitiesCard";
import { EquityCard } from "./components/EquityCard";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface BalanceSheetProps {
  userId?: string;
}

export function BalanceSheet({ userId }: BalanceSheetProps) {
  const isMobile = useIsMobile();
  const [loading, setLoading] = React.useState(false);
  const [date, setDate] = React.useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });

  const { data: reportData, refetch: generateReport } = useQuery({
    queryKey: ["balance-sheet", date.from, date.to],
    queryFn: async () => {
      if (!userId || !date.from || !date.to) return null;
      return fetchBalanceSheetData(userId, date.from, date.to);
    },
    enabled: false,
  });

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      await generateReport();
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="w-full sm:w-auto">
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
        <Button 
          onClick={handleGenerateReport} 
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generar Reporte
        </Button>
      </div>
      <div className="min-h-[400px] p-2 sm:p-4 border rounded-lg">
        {!reportData ? (
          <p className="text-center text-muted-foreground">
            Seleccione un rango de fechas y genere el reporte
          </p>
        ) : (
          <div className="space-y-4">
            <AssetsCard 
              bankAccounts={reportData.assets.bankAccounts}
              accountsReceivable={reportData.assets.accountsReceivable}
              total={reportData.assets.total}
              formatAmount={formatAmount}
            />
            <LiabilitiesCard 
              accountsPayable={reportData.liabilities.accountsPayable}
              total={reportData.liabilities.total}
              formatAmount={formatAmount}
            />
            <EquityCard 
              netIncome={reportData.equity.netIncome}
              total={reportData.equity.total}
              formatAmount={formatAmount}
            />
          </div>
        )}
      </div>
    </div>
  );
}
