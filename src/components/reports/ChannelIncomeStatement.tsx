
import * as React from "react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { addDays } from "date-fns";
import { Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";

interface ChannelIncomeStatementProps {
  userId?: string;
}

export function ChannelIncomeStatement({ userId }: ChannelIncomeStatementProps) {
  const [loading, setLoading] = React.useState(false);
  const [date, setDate] = React.useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const generateReport = async () => {
    if (!userId || !date.from || !date.to) return;
    setLoading(true);
    try {
      // Implementation pending - will be added in next iteration
      console.log("Generating channel income statement for:", { userId, date });
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <DatePickerWithRange date={date} setDate={setDate} />
        <Button onClick={generateReport} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generar Reporte
        </Button>
      </div>
      <div className="min-h-[400px] p-4 border rounded-lg">
        <p className="text-center text-muted-foreground">
          Seleccione un rango de fechas y genere el reporte
        </p>
      </div>
    </div>
  );
}
