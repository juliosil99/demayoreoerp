
import React from "react";
import { CreateForecastDialog } from "./CreateForecastDialog";
import { GenerateForecastDialog } from "./GenerateForecastDialog";
import { ForecastItemDialog } from "./ForecastItemDialog";
import { OpenAIKeyDialog } from "./OpenAIKeyDialog";
import { ForecastItem, ForecastWeek } from "@/types/cashFlow";
import { ForecastDataCount } from "./forecast-generation/types";

interface ForecastDialogsProps {
  isCreateDialogOpen: boolean;
  isGenerateDialogOpen: boolean;
  isItemDialogOpen: boolean;
  isOpenAIDialogOpen: boolean;
  selectedWeek?: ForecastWeek;
  editingItem?: ForecastItem;
  historicalDataCount: ForecastDataCount;
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
      
      {selectedWeek && (
        <ForecastItemDialog
          isOpen={isItemDialogOpen}
          onClose={onCloseItemDialog}
          week={selectedWeek}
          item={editingItem}
          onSave={onSaveItem}
        />
      )}
      
      <OpenAIKeyDialog
        isOpen={isOpenAIDialogOpen}
        onClose={onCloseOpenAIDialog}
        onSave={onSaveOpenAIKey}
      />
    </>
  );
}
