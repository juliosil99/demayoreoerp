
import React from "react";
import { CreateForecastDialog } from "./CreateForecastDialog";
import { GenerateForecastDialog } from "./GenerateForecastDialog";
import { ForecastItemDialog } from "./ForecastItemDialog";
import { OpenAIKeyDialog } from "./OpenAIKeyDialog";
import { ForecastItem, ForecastWeek } from "@/types/cashFlow";

interface ForecastDialogsProps {
  isCreateDialogOpen: boolean;
  isGenerateDialogOpen: boolean;
  isItemDialogOpen: boolean;
  isOpenAIDialogOpen: boolean;
  selectedWeek?: ForecastWeek;
  editingItem?: ForecastItem;
  historicalDataCount: Record<string, number>;
  isCreating: boolean;
  isGenerating: boolean;
  onCloseCreateDialog: () => void;
  onCloseGenerateDialog: () => void;
  onCloseItemDialog: () => void;
  onCloseOpenAIDialog: () => void;
  onCreateForecast: (name: string, startDate: Date) => Promise<{success: boolean, message?: string}>;
  onGenerateForecast: (options: Record<string, any>) => Promise<boolean>;
  onSaveItem: (item: Partial<ForecastItem>) => Promise<boolean>;
  onSaveOpenAIKey: (apiKey: string) => Promise<boolean>;
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
        open={isCreateDialogOpen}
        onOpenChange={onCloseCreateDialog}
        onCreate={onCreateForecast}
        isLoading={isCreating}
      />
      
      <GenerateForecastDialog
        open={isGenerateDialogOpen}
        onOpenChange={onCloseGenerateDialog}
        onGenerate={onGenerateForecast}
        isLoading={isGenerating}
        historicalDataCount={historicalDataCount}
      />
      
      {selectedWeek && (
        <ForecastItemDialog
          open={isItemDialogOpen}
          onOpenChange={onCloseItemDialog}
          week={selectedWeek}
          item={editingItem}
          onSave={onSaveItem}
        />
      )}
      
      <OpenAIKeyDialog
        open={isOpenAIDialogOpen}
        onOpenChange={onCloseOpenAIDialog}
        onSave={onSaveOpenAIKey}
      />
    </>
  );
}
