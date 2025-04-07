
import React from "react";
import { CreateForecastDialog } from "@/components/cash-flow/CreateForecastDialog";
import { GenerateForecastDialog } from "@/components/cash-flow/GenerateForecastDialog";
import { ForecastItemDialog } from "@/components/cash-flow/ForecastItemDialog";
import { OpenAIKeyDialog } from "@/components/cash-flow/OpenAIKeyDialog";
import { ForecastItem, ForecastWeek } from "@/types/cashFlow";

interface ForecastDialogsProps {
  isCreateDialogOpen: boolean;
  isGenerateDialogOpen: boolean;
  isItemDialogOpen: boolean;
  isOpenAIDialogOpen: boolean;
  selectedWeek?: ForecastWeek;
  editingItem?: ForecastItem;
  historicalDataCount: {
    payables: number;
    receivables: number;
    expenses: number;
    sales: number;
    bankAccounts: number;
  };
  isCreating: boolean;
  isGenerating: boolean;
  onCloseCreateDialog: () => void;
  onCloseGenerateDialog: () => void;
  onCloseItemDialog: () => void;
  onCloseOpenAIDialog: () => void;
  onCreateForecast: (name: string, startDate: Date) => void;
  onGenerateForecast: (options: Record<string, any>) => void;
  onSaveItem: (item: Partial<ForecastItem>) => void;
  onSaveOpenAIKey: (apiKey: string) => void;
}

export function ForecastDialogs({
  isCreateDialogOpen,
  isGenerateDialogOpen,
  isItemDialogOpen,
  isOpenAIDialogOpen,
  selectedWeek,
  editingItem,
  historicalDataCount,
  isCreating,
  isGenerating,
  onCloseCreateDialog,
  onCloseGenerateDialog,
  onCloseItemDialog,
  onCloseOpenAIDialog,
  onCreateForecast,
  onGenerateForecast,
  onSaveItem,
  onSaveOpenAIKey
}: ForecastDialogsProps) {
  return (
    <>
      <CreateForecastDialog 
        isOpen={isCreateDialogOpen}
        onClose={onCloseCreateDialog}
        onCreateForecast={onCreateForecast}
        isCreating={isCreating}
      />
      
      <GenerateForecastDialog 
        isOpen={isGenerateDialogOpen}
        onClose={onCloseGenerateDialog}
        onGenerate={onGenerateForecast}
        isLoading={isGenerating}
        historicalDataCount={historicalDataCount}
      />
      
      <ForecastItemDialog 
        isOpen={isItemDialogOpen}
        onClose={onCloseItemDialog}
        onSave={onSaveItem}
        selectedWeek={selectedWeek}
        item={editingItem}
      />
      
      <OpenAIKeyDialog 
        isOpen={isOpenAIDialogOpen}
        onClose={onCloseOpenAIDialog}
        onSave={onSaveOpenAIKey}
      />
    </>
  );
}
