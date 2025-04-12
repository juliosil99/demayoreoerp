
import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IncomeStatement } from "@/components/reports/IncomeStatement";
import { CashFlow } from "@/components/reports/CashFlow";
import { BalanceSheet } from "@/components/reports/BalanceSheet";
import { ChannelIncomeStatement } from "@/components/reports/ChannelIncomeStatement";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Reports() {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="container mx-auto p-2 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Reportes Contables</h1>
      
      <Tabs defaultValue="income" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="income">Estado de Resultados</TabsTrigger>
            <TabsTrigger value="cash-flow">Flujo de Efectivo</TabsTrigger>
            <TabsTrigger value="balance">Balance General</TabsTrigger>
            <TabsTrigger value="channel-income">Por Canal</TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Estado de Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeStatement userId={user?.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Flujo de Efectivo</CardTitle>
            </CardHeader>
            <CardContent>
              <CashFlow userId={user?.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Balance General</CardTitle>
            </CardHeader>
            <CardContent>
              <BalanceSheet userId={user?.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channel-income">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Estado de Resultados por Canal</CardTitle>
            </CardHeader>
            <CardContent>
              <ChannelIncomeStatement userId={user?.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
