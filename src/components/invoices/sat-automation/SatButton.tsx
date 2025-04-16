
import React, { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SatAutomationDialog } from "./SatAutomationDialog";

export function SatButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button 
        variant="default" 
        onClick={handleOpenDialog}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        <span className="hidden md:inline">Descargar del SAT</span>
        <span className="inline md:hidden">SAT</span>
      </Button>

      <SatAutomationDialog 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </>
  );
}
