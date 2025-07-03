import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, CheckCircle, ArrowRight, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useAutoReconciliation, AutoReconciliationGroup } from "../hooks/useAutoReconciliation";
import { useOptimizedPaymentQueries } from "../hooks/useOptimizedPaymentQueries";
import { supabase } from "@/integrations/supabase/client";

interface Payment {
  id: string;
  date: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  is_reconciled: boolean;
}

interface PaymentMatch {
  paymentId: string;
  groupId: string;
  amountDifference: number;
  isCompatible: boolean;
}

interface ManualAutoReconciliationDialogProps {
  onClose: () => void;
  onProcessMatches: (matches: PaymentMatch[]) => void;
}

export function ManualAutoReconciliationDialog({
  onClose,
  onProcessMatches,
}: ManualAutoReconciliationDialogProps) {
  const [groups, setGroups] = useState<AutoReconciliationGroup[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [matches, setMatches] = useState<PaymentMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tolerancePercentage, setTolerancePercentage] = useState(5);
  const [dateRange, setDateRange] = useState(7); // días hacia atrás

  const { detectAutoReconciliationGroups } = useAutoReconciliation();

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Cargar grupos de ventas
      const detectedGroups = await detectAutoReconciliationGroups();
      setGroups(detectedGroups);

      // Cargar pagos no reconciliados
      if (detectedGroups.length > 0) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - dateRange);
        
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select("id, date, amount, payment_method, reference_number, is_reconciled")
          .eq("is_reconciled", false)
          .gte("date", startDate.toISOString().split('T')[0])
          .order("date", { ascending: false });

        if (paymentsError) throw paymentsError;
        setPayments(paymentsData || []);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const isPaymentMethodCompatible = (paymentMethod: string, groupMethod: string) => {
    const normalize = (method: string) => method.toLowerCase().trim();
    const pm = normalize(paymentMethod);
    const gm = normalize(groupMethod);
    
    return pm === gm || 
           (pm === 'cash' && gm === 'efectivo') ||
           (pm === 'efectivo' && gm === 'cash') ||
           (pm === 'transfer' && gm === 'transferencia') ||
           (pm === 'transferencia' && gm === 'transfer');
  };

  const calculateCompatibility = (payment: Payment, group: AutoReconciliationGroup) => {
    const amountDifference = Math.abs(payment.amount - group.totalAmount);
    const percentageDifference = (amountDifference / group.totalAmount) * 100;
    const isAmountCompatible = percentageDifference <= tolerancePercentage;
    const isMethodCompatible = isPaymentMethodCompatible(payment.payment_method, group.paymentMethod);
    
    return {
      amountDifference,
      percentageDifference,
      isAmountCompatible,
      isMethodCompatible,
      isCompatible: isAmountCompatible && isMethodCompatible
    };
  };

  const handleCreateMatch = (paymentId: string, groupId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    const group = groups.find(g => g.id === groupId);
    
    if (!payment || !group) return;

    const compatibility = calculateCompatibility(payment, group);
    
    const newMatch: PaymentMatch = {
      paymentId,
      groupId,
      amountDifference: compatibility.amountDifference,
      isCompatible: compatibility.isCompatible
    };

    // Remover matches existentes para este pago o grupo
    const filteredMatches = matches.filter(
      m => m.paymentId !== paymentId && m.groupId !== groupId
    );
    
    setMatches([...filteredMatches, newMatch]);
  };

  const handleRemoveMatch = (paymentId: string, groupId: string) => {
    setMatches(matches.filter(
      m => !(m.paymentId === paymentId && m.groupId === groupId)
    ));
  };

  const isPaymentMatched = (paymentId: string) => 
    matches.some(m => m.paymentId === paymentId);

  const isGroupMatched = (groupId: string) => 
    matches.some(m => m.groupId === groupId);

  const getMatchForPayment = (paymentId: string) => 
    matches.find(m => m.paymentId === paymentId);

  const getMatchForGroup = (groupId: string) => 
    matches.find(m => m.groupId === groupId);

  const validMatches = matches.filter(m => m.isCompatible);
  const canProcess = validMatches.length > 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando datos para reconciliación...</span>
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
            <Button onClick={loadData} variant="outline">
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
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tolerance">Tolerancia de Monto (%)</Label>
              <Input
                id="tolerance"
                type="number"
                value={tolerancePercentage}
                onChange={(e) => setTolerancePercentage(Number(e.target.value))}
                min="0"
                max="50"
              />
            </div>
            <div>
              <Label htmlFor="dateRange">Rango de Fechas (días)</Label>
              <Select value={dateRange.toString()} onValueChange={(value) => setDateRange(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 días</SelectItem>
                  <SelectItem value="15">15 días</SelectItem>
                  <SelectItem value="30">30 días</SelectItem>
                  <SelectItem value="60">60 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-sm text-muted-foreground">Pagos Disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{groups.length}</div>
            <p className="text-sm text-muted-foreground">Grupos de Ventas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{validMatches.length}</div>
            <p className="text-sm text-muted-foreground">Coincidencias Válidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payments Column */}
        <Card>
          <CardHeader>
            <CardTitle>Pagos Sin Reconciliar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {payments.map((payment) => {
              const matched = isPaymentMatched(payment.id);
              const match = getMatchForPayment(payment.id);
              const matchedGroup = match ? groups.find(g => g.id === match.groupId) : null;
              
              return (
                <div
                  key={payment.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    matched 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-border hover:border-primary'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{formatCurrency(payment.amount)}</div>
                      <div className="text-sm text-muted-foreground">
                        {payment.date} • {payment.payment_method}
                      </div>
                      {payment.reference_number && (
                        <div className="text-xs text-muted-foreground">
                          Ref: {payment.reference_number}
                        </div>
                      )}
                    </div>
                    {matched && matchedGroup && (
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          → {matchedGroup.channel}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveMatch(payment.id, match.groupId)}
                          className="ml-2 h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Sales Groups Column */}
        <Card>
          <CardHeader>
            <CardTitle>Grupos de Ventas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {groups.map((group) => {
              const matched = isGroupMatched(group.id);
              const match = getMatchForGroup(group.id);
              const matchedPayment = match ? payments.find(p => p.id === match.paymentId) : null;
              
              return (
                <div
                  key={group.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    matched 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-border hover:border-primary'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{formatCurrency(group.totalAmount)}</div>
                      <div className="text-sm text-muted-foreground">
                        {group.date} • {group.channel} • {group.paymentMethod}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {group.sales.length} ventas
                      </div>
                    </div>
                    <div className="text-right">
                      {group.status === 'perfect' && (
                        <Badge className="bg-green-100 text-green-800">Perfecto</Badge>
                      )}
                      {group.status === 'minor_discrepancy' && (
                        <Badge className="bg-yellow-100 text-yellow-800">Menor</Badge>
                      )}
                      {matched && matchedPayment && (
                        <div className="mt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveMatch(match.paymentId, group.id)}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Suggested Matches */}
      <Card>
        <CardHeader>
          <CardTitle>Coincidencias Sugeridas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {payments.map((payment) => 
              groups.map((group) => {
                const compatibility = calculateCompatibility(payment, group);
                if (!compatibility.isCompatible || isPaymentMatched(payment.id) || isGroupMatched(group.id)) return null;
                
                return (
                  <div
                    key={`${payment.id}-${group.id}`}
                    className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 border-blue-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <strong>{formatCurrency(payment.amount)}</strong> ({payment.date})
                      </div>
                      <ArrowRight className="h-4 w-4 text-blue-600" />
                      <div className="text-sm">
                        <strong>{formatCurrency(group.totalAmount)}</strong> ({group.channel})
                      </div>
                      {compatibility.amountDifference > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Diff: {formatCurrency(compatibility.amountDifference)}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCreateMatch(payment.id, group.id)}
                    >
                      Conectar
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {validMatches.length} coincidencias válidas para procesar
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => onProcessMatches(validMatches)}
            disabled={!canProcess}
          >
            Procesar Reconciliaciones ({validMatches.length})
          </Button>
        </div>
      </div>
    </div>
  );
}