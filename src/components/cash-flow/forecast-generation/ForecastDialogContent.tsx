
import React from "react";
import { Separator } from "@/components/ui/separator";
import { ReconciliationSection } from "./ReconciliationSection";
import { DataSourcesPanel } from "./DataSourcesPanel";
import { ForecastOptionsPanel } from "./ForecastOptionsPanel";
import { ForecastDataCount, ForecastOptions } from "./types";
import { CashFlowForecast } from "@/types/cashFlow";

interface ForecastDialogContentProps {
  options: ForecastOptions;
  onOptionChange: <K extends keyof ForecastOptions>(option: K, value: ForecastOptions[K]) => void;
  reconcileBalances: boolean;
  setReconcileBalances: (value: boolean) => void;
  needsBalanceReconciliation: boolean;
  historicalDataCount: ForecastDataCount;
}

export function ForecastDialogContent({
  options,
  onOptionChange,
  reconcileBalances,
  setReconcileBalances,
  needsBalanceReconciliation,
  historicalDataCount
}: ForecastDialogContentProps) {
  return (
    <div className="space-y-6 my-4">
      {/* Reconciliation Section */}
      <ReconciliationSection 
        reconcileBalances={reconcileBalances}
        setReconcileBalances={setReconcileBalances}
        needsBalanceReconciliation={needsBalanceReconciliation}
        historicalDataCount={historicalDataCount}
      />
      
      <Separator />

      {/* Data Sources and Settings Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DataSourcesPanel historicalDataCount={historicalDataCount} />
        
        <ForecastOptionsPanel 
          options={options}
          onOptionChange={onOptionChange}
        />
      </div>
    </div>
  );
}
