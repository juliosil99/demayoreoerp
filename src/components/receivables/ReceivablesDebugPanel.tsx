import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface QueryStats {
  totalRecords: number;
  oldestDate: string | null;
  newestDate: string | null;
  uniqueChannels: number;
  queryTime: number;
}

interface ReceivablesDebugPanelProps {
  isLoading: boolean;
  error: any;
  salesCount: number;
  totalCount: number;
  queryStats?: QueryStats;
  filters: {
    searchTerm: string;
    startDate: string;
    endDate: string;
    selectedChannel: string;
  };
}

export function ReceivablesDebugPanel({
  isLoading,
  error,
  salesCount,
  totalCount,
  queryStats,
  filters,
}: ReceivablesDebugPanelProps) {
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800">Panel de Diagnóstico</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Estado de Consulta:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Loading: {isLoading ? "Sí" : "No"}</li>
              <li>• Error: {error ? "Sí" : "No"}</li>
              <li>• Registros en página: {salesCount}</li>
              <li>• Total en base de datos: {totalCount}</li>
            </ul>
          </div>
          <div>
            <strong>Filtros Activos:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Fecha desde: {filters.startDate || "Sin filtro"}</li>
              <li>• Fecha hasta: {filters.endDate || "Sin filtro"}</li>
              <li>• Canal: {filters.selectedChannel === "all" ? "Todos" : filters.selectedChannel}</li>
              <li>• Búsqueda: {filters.searchTerm || "Sin filtro"}</li>
            </ul>
          </div>
          {queryStats && (
            <div className="md:col-span-2">
              <strong>Estadísticas de Datos:</strong>
              <ul className="mt-2 space-y-1">
                <li>• Fecha más antigua: {queryStats.oldestDate}</li>
                <li>• Fecha más reciente: {queryStats.newestDate}</li>
                <li>• Canales únicos: {queryStats.uniqueChannels}</li>
                <li>• Tiempo de consulta: {queryStats.queryTime}ms</li>
              </ul>
            </div>
          )}
        </div>
        {error && (
          <Alert className="mt-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              Error: {error.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}