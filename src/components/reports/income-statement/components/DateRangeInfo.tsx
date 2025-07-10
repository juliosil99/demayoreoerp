
import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DateRangeInfoProps } from "../types";
import { parseDateFromDB } from "@/utils/dateUtils";

export const DateRangeInfo: React.FC<DateRangeInfoProps> = ({ reportData, onExport }) => {
  const getDateRangeText = () => {
    if (!reportData?.currentPeriod) return "";

    const startDate = parseDateFromDB(reportData.currentPeriod.startDate);
    const endDate = parseDateFromDB(reportData.currentPeriod.endDate);
    
    return `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`;
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="font-medium text-sm text-gray-500">Período:</h3>
        <p className="font-medium">{getDateRangeText()}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
    </div>
  );
};
