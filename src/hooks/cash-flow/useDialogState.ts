
import { useState } from "react";
import { ForecastItem, ForecastWeek } from "@/types/cashFlow";

export function useDialogState() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isOpenAIDialogOpen, setIsOpenAIDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ForecastItem | undefined>();
  const [selectedWeek, setSelectedWeek] = useState<ForecastWeek | undefined>();

  const openCreateDialog = () => setIsCreateDialogOpen(true);
  const closeCreateDialog = () => setIsCreateDialogOpen(false);
  
  const openGenerateDialog = () => setIsGenerateDialogOpen(true);
  const closeGenerateDialog = () => setIsGenerateDialogOpen(false);
  
  const openItemDialog = (item?: ForecastItem) => {
    setEditingItem(item);
    setIsItemDialogOpen(true);
  };
  const closeItemDialog = () => setIsItemDialogOpen(false);
  
  const openOpenAIDialog = () => setIsOpenAIDialogOpen(true);
  const closeOpenAIDialog = () => setIsOpenAIDialogOpen(false);
  
  const handleSelectWeek = (week: ForecastWeek) => {
    setSelectedWeek(week);
  };

  return {
    isCreateDialogOpen,
    isGenerateDialogOpen,
    isItemDialogOpen,
    isOpenAIDialogOpen,
    editingItem,
    selectedWeek,
    openCreateDialog,
    closeCreateDialog,
    openGenerateDialog,
    closeGenerateDialog,
    openItemDialog,
    closeItemDialog,
    openOpenAIDialog,
    closeOpenAIDialog,
    handleSelectWeek
  };
}
