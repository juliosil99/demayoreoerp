
import { useState, useEffect } from "react";

export function useForecastSelection() {
  const [selectedForecastId, setSelectedForecastId] = useState<string | undefined>();

  const handleForecastChange = (forecastId: string) => {
    setSelectedForecastId(forecastId);
  };

  return {
    selectedForecastId,
    setSelectedForecastId,
    handleForecastChange
  };
}
