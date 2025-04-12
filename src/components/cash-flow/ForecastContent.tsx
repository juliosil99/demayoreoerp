
import React from "react";
import { ForecastWeek, ForecastItem, CashFlowForecast } from "@/types/cashFlow";
import { ForecastSummarySection } from "@/components/cash-flow/content/ForecastSummarySection";
import { ForecastChartSection } from "@/components/cash-flow/content/ForecastChartSection";
import { ForecastDetailsSection } from "@/components/cash-flow/content/ForecastDetailsSection";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, differenceInDays } from "date-fns";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

interface ForecastContentProps {
  weeks: ForecastWeek[];
  items: ForecastItem[];
  forecast?: CashFlowForecast | null;
  selectedWeek?: ForecastWeek;
  insights?: string;
  isGenerating: boolean;
  onSelectWeek: (week: ForecastWeek) => void;
  onAddItem: () => void;
  onEditItem: (item: ForecastItem) => void;
  onRequestAPIKey: () => void;
  onUpdateForecast?: () => void;
}

export function ForecastContent({
  weeks,
  items,
  forecast,
  selectedWeek,
  insights,
  isGenerating,
  onSelectWeek,
  onAddItem,
  onEditItem,
  onRequestAPIKey,
  onUpdateForecast
}: ForecastContentProps) {
  // Determine the balance confidence status
  const getBalanceConfidenceInfo = () => {
    if (!forecast || !forecast.last_reconciled_date) {
      return { 
        status: 'unknown',
        label: 'Estado desconocido',
        color: 'bg-gray-200 text-gray-700',
        icon: Clock
      };
    }
    
    const lastReconciled = parseISO(forecast.last_reconciled_date);
    const today = new Date();
    const daysSinceReconciliation = differenceInDays(today, lastReconciled);
    
    if (forecast.is_balance_confirmed) {
      return {
        status: 'confirmed',
        label: `Saldos confirmados (${format(lastReconciled, 'dd/MM/yyyy')})`,
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle2
      };
    } else if (daysSinceReconciliation <= 7) {
      return {
        status: 'recent',
        label: `Actualizado hace ${daysSinceReconciliation} días`,
        color: 'bg-amber-100 text-amber-800',
        icon: Clock
      };
    } else {
      return {
        status: 'outdated',
        label: `Desactualizado (${daysSinceReconciliation} días)`,
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle
      };
    }
  };
  
  const balanceInfo = getBalanceConfidenceInfo();
  const BalanceIcon = balanceInfo.icon;
  
  return (
    <div className="space-y-6">
      {/* Display balance confidence status */}
      {forecast && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={balanceInfo.color}>
              <BalanceIcon className="w-3 h-3 mr-1" />
              {balanceInfo.label}
            </Badge>
          </div>
          
          {forecast.last_reconciled_date && (
            <span className="text-sm text-muted-foreground">
              Pronóstico de 13 semanas desde {format(parseISO(forecast.start_date), 'dd/MM/yyyy')}
            </span>
          )}
        </div>
      )}
      
      <ForecastSummarySection weeks={weeks} forecast={forecast} />
      
      <ForecastChartSection weeks={weeks} />
      
      <ForecastDetailsSection
        weeks={weeks}
        items={items}
        selectedWeek={selectedWeek}
        insights={insights}
        isGenerating={isGenerating}
        onSelectWeek={onSelectWeek}
        onAddItem={onAddItem}
        onEditItem={onEditItem}
        onRequestAPIKey={onRequestAPIKey}
        onUpdateForecast={onUpdateForecast}
      />
    </div>
  );
}
