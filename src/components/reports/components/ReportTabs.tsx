
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReportContent } from "./ReportContent";
import { FinancialPeriodType } from "@/types/financial-reporting";

interface ReportTabsProps {
  userId?: string;
  periodId: string | null;
  periodType: FinancialPeriodType;
  compareWithPreviousYear: boolean;
  periodsExist: boolean;
}

export function ReportTabs({
  userId,
  periodId,
  periodType,
  compareWithPreviousYear,
  periodsExist
}: ReportTabsProps) {
  const [activeTab, setActiveTab] = React.useState("income");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs defaultValue="income" className="w-full" onValueChange={handleTabChange}>
      <ScrollArea className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="income">Estado de Resultados</TabsTrigger>
          <TabsTrigger value="cash-flow">Flujo de Efectivo</TabsTrigger>
          <TabsTrigger value="balance">Balance General</TabsTrigger>
          <TabsTrigger value="channel-income">Por Canal</TabsTrigger>
        </TabsList>
      </ScrollArea>

      <TabsContent value="income">
        <ReportContent
          activeTab="income"
          userId={userId}
          periodId={periodId || ""}
          periodType={periodType}
          compareWithPreviousYear={compareWithPreviousYear}
          periodsExist={periodsExist}
        />
      </TabsContent>

      <TabsContent value="cash-flow">
        <ReportContent
          activeTab="cash-flow"
          userId={userId}
          periodId={periodId || ""}
          periodType={periodType}
          compareWithPreviousYear={compareWithPreviousYear}
          periodsExist={periodsExist}
        />
      </TabsContent>

      <TabsContent value="balance">
        <ReportContent
          activeTab="balance"
          userId={userId}
          periodId={periodId || ""}
          periodType={periodType}
          compareWithPreviousYear={compareWithPreviousYear}
          periodsExist={periodsExist}
        />
      </TabsContent>

      <TabsContent value="channel-income">
        <ReportContent
          activeTab="channel-income"
          userId={userId}
          periodId={periodId || ""}
          periodType={periodType}
          compareWithPreviousYear={compareWithPreviousYear}
          periodsExist={periodsExist}
        />
      </TabsContent>
    </Tabs>
  );
}
