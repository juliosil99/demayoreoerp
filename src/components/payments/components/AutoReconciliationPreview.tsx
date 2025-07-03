import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useAutoReconciliation, AutoReconciliationGroup } from "../hooks/useAutoReconciliation";

interface AutoReconciliationPreviewProps {
  onClose: () => void;
  onProcessSelected: (groups: AutoReconciliationGroup[]) => void;
}

export function AutoReconciliationPreview({
  onClose,
  onProcessSelected,
}: AutoReconciliationPreviewProps) {
  const [groups, setGroups] = useState<AutoReconciliationGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    selectedGroups,
    setSelectedGroups,
    detectAutoReconciliationGroups,
  } = useAutoReconciliation();

  const loadGroups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const detectedGroups = await detectAutoReconciliationGroups();
      setGroups(detectedGroups);
    } catch (err) {
      console.error("Error loading groups:", err);
      setError("Error al cargar los grupos de auto-reconciliación");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleSelectAll = (status?: AutoReconciliationGroup['status']) => {
    if (status) {
      const filteredIds = groups
        .filter(group => group.status === status)
        .map(group => group.id);
      setSelectedGroups(filteredIds);
    } else {
      const allIds = groups.map(group => group.id);
      setSelectedGroups(selectedGroups.length === allIds.length ? [] : allIds);
    }
  };

  const handleSelectGroup = (groupId: string, checked: boolean) => {
    if (checked) {
      setSelectedGroups([...selectedGroups, groupId]);
    } else {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    }
  };

  const getStatusBadge = (status: AutoReconciliationGroup['status']) => {
    switch (status) {
      case 'perfect':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Perfecto
          </Badge>
        );
      case 'minor_discrepancy':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Discrepancia Menor
          </Badge>
        );
      case 'major_discrepancy':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Requiere Revisión
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: AutoReconciliationGroup['status']) => {
    switch (status) {
      case 'perfect':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'minor_discrepancy':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'major_discrepancy':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const perfectGroups = groups.filter(g => g.status === 'perfect');
  const minorDiscrepancyGroups = groups.filter(g => g.status === 'minor_discrepancy');
  const majorDiscrepancyGroups = groups.filter(g => g.status === 'major_discrepancy');

  const selectedGroupsData = groups.filter(group => selectedGroups.includes(group.id));
  const canProcess = selectedGroupsData.length > 0 && 
    selectedGroupsData.every(group => group.status !== 'major_discrepancy');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Detectando grupos para auto-reconciliación...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-center mt-4">
            <Button onClick={loadGroups} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Grupos Perfectos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {perfectGroups.length}
            </div>
            <p className="text-xs text-green-600">
              {formatCurrency(perfectGroups.reduce((sum, g) => sum + g.totalAmount, 0))}
            </p>
            {perfectGroups.length > 0 && (
              <Button
                size="sm"
                className="mt-2 w-full"
                onClick={() => handleSelectAll('perfect')}
              >
                Seleccionar Todos
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">
              Discrepancias Menores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {minorDiscrepancyGroups.length}
            </div>
            <p className="text-xs text-yellow-600">
              {formatCurrency(minorDiscrepancyGroups.reduce((sum, g) => sum + g.totalAmount, 0))}
            </p>
            {minorDiscrepancyGroups.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={() => handleSelectAll('minor_discrepancy')}
              >
                Seleccionar Todos
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800">
              Requieren Revisión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {majorDiscrepancyGroups.length}
            </div>
            <p className="text-xs text-red-600">
              {formatCurrency(majorDiscrepancyGroups.reduce((sum, g) => sum + g.totalAmount, 0))}
            </p>
            <p className="text-xs text-red-600 mt-2">
              No se pueden auto-procesar
            </p>
          </CardContent>
        </Card>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No se encontraron grupos elegibles para auto-reconciliación.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Groups Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Grupos Detectados ({groups.length})</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAll()}
                  >
                    {selectedGroups.length === groups.length ? "Deseleccionar" : "Seleccionar"} Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadGroups}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Método de Pago</TableHead>
                    <TableHead>Ventas</TableHead>
                    <TableHead>Monto Total</TableHead>
                    <TableHead>Discrepancia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow 
                      key={group.id}
                      className={selectedGroups.includes(group.id) ? "bg-muted/50" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedGroups.includes(group.id)}
                          onCheckedChange={(checked) => 
                            handleSelectGroup(group.id, checked as boolean)
                          }
                          disabled={group.status === 'major_discrepancy'}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(group.status)}
                          {getStatusBadge(group.status)}
                        </div>
                      </TableCell>
                      <TableCell>{group.date}</TableCell>
                      <TableCell>{group.channel}</TableCell>
                      <TableCell>{group.paymentMethod}</TableCell>
                      <TableCell>{group.sales.length}</TableCell>
                      <TableCell>{formatCurrency(group.totalAmount)}</TableCell>
                      <TableCell>
                        {group.discrepancyAmount ? (
                          <span className="text-red-600">
                            {formatCurrency(group.discrepancyAmount)}
                          </span>
                        ) : (
                          <span className="text-green-600">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {selectedGroups.length} grupos seleccionados
              {selectedGroupsData.length > 0 && (
                <span className="ml-2">
                  - Total: {formatCurrency(selectedGroupsData.reduce((sum, g) => sum + g.totalAmount, 0))}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={() => onProcessSelected(selectedGroupsData)}
                disabled={!canProcess}
              >
                Procesar Seleccionados ({selectedGroups.length})
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}