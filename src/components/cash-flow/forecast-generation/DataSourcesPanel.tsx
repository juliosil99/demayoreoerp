
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForecastDataCount } from "./types";
import { Check, AlertCircle, Wallet, CreditCard, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DataSourcesPanelProps {
  historicalDataCount: ForecastDataCount;
}

export function DataSourcesPanel({ historicalDataCount }: DataSourcesPanelProps) {
  const {
    payables, 
    receivables, 
    expenses, 
    sales, 
    bankAccountsCount = 0,
    availableCashBalance = 0,
    creditLiabilities = 0,
    netPosition = 0
  } = historicalDataCount;
  
  const hasData = payables > 0 || receivables > 0 || expenses > 0 || sales > 0 || bankAccountsCount > 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Fuentes de Datos
          {hasData ? (
            <Check className="ml-2 h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="ml-2 h-5 w-5 text-amber-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Cuentas por Pagar</div>
              <div className="text-xl font-semibold">{payables}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Cuentas por Cobrar</div>
              <div className="text-xl font-semibold">{receivables}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Gastos</div>
              <div className="text-xl font-semibold">{expenses}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Ventas</div>
              <div className="text-xl font-semibold">{sales}</div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-2">Cuentas Bancarias</div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Wallet className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Saldo Disponible</span>
                </div>
                <span className={`font-semibold ${availableCashBalance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                  {formatCurrency(availableCashBalance)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4 text-red-500" />
                  <span>Deuda en Crédito</span>
                </div>
                <span className="font-semibold text-red-500">
                  {formatCurrency(Math.abs(creditLiabilities))}
                </span>
              </div>
              
              <div className="flex justify-between items-center border-t pt-2">
                <div className="flex items-center">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  <span>Posición Neta</span>
                </div>
                <span className={`font-semibold ${netPosition >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(netPosition)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
