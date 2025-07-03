import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/formatters";
import { Calculator, Plus, Minus } from "lucide-react";

interface PaymentAdjustment {
  id: string;
  type: 'commission' | 'shipping' | 'other';
  amount: number;
  description: string;
}

interface ReconciliationCalculatorProps {
  selectedOrdersTotal: number;
  paymentAmount: number;
  adjustments: PaymentAdjustment[];
  onAdjustmentAdd: (adjustment: Omit<PaymentAdjustment, 'id'>) => void;
  onAdjustmentRemove: (id: string) => void;
}

export function ReconciliationCalculator({
  selectedOrdersTotal,
  paymentAmount,
  adjustments,
  onAdjustmentAdd,
  onAdjustmentRemove
}: ReconciliationCalculatorProps) {
  const [newAdjustment, setNewAdjustment] = useState<{
    type: PaymentAdjustment['type'];
    amount: number;
    description: string;
  }>({
    type: 'commission',
    amount: 0,
    description: ''
  });

  const totalAdjustments = adjustments.reduce((sum, adj) => sum + adj.amount, 0);
  const finalTotal = selectedOrdersTotal + totalAdjustments;
  const difference = finalTotal - paymentAmount;
  const isBalanced = Math.abs(difference) < 0.01;

  const handleAddAdjustment = () => {
    if (newAdjustment.amount !== 0 && newAdjustment.description.trim()) {
      onAdjustmentAdd({
        ...newAdjustment,
        amount: -Math.abs(newAdjustment.amount) // Always negative for deductions
      });
      setNewAdjustment({ type: 'commission', amount: 0, description: '' });
    }
  };

  const getAdjustmentTypeLabel = (type: PaymentAdjustment['type']) => {
    switch (type) {
      case 'commission': return 'Comisión';
      case 'shipping': return 'Envío';
      case 'other': return 'Otro';
    }
  };

  const getAdjustmentTypeColor = (type: PaymentAdjustment['type']) => {
    switch (type) {
      case 'commission': return 'bg-red-100 text-red-800';
      case 'shipping': return 'bg-blue-100 text-blue-800';
      case 'other': return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5" />
          Calculadora de Reconciliación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Totals Summary */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total de Órdenes:</span>
            <span className="font-mono">{formatCurrency(selectedOrdersTotal)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Pago Recibido:</span>
            <span className="font-mono font-semibold">{formatCurrency(paymentAmount)}</span>
          </div>

          {adjustments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium">Ajustes:</span>
                {adjustments.map((adjustment) => (
                  <div key={adjustment.id} className="flex justify-between items-center group">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getAdjustmentTypeColor(adjustment.type)}`}>
                        {getAdjustmentTypeLabel(adjustment.type)}
                      </Badge>
                      <span className="text-sm">{adjustment.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-red-600">
                        {formatCurrency(adjustment.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAdjustmentRemove(adjustment.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Final:</span>
            <span className="font-mono font-semibold">{formatCurrency(finalTotal)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Diferencia:</span>
            <span className={`font-mono font-semibold ${
              isBalanced ? 'text-green-600' : Math.abs(difference) < 0.01 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(difference)}
            </span>
          </div>

          {isBalanced && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium text-center">
                ✓ Reconciliación Balanceada
              </p>
            </div>
          )}
        </div>

        {/* Add Adjustment Form */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Agregar Ajuste</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="adjustment-type" className="text-xs">Tipo</Label>
                <select
                  id="adjustment-type"
                  value={newAdjustment.type}
                  onChange={(e) => setNewAdjustment(prev => ({ 
                    ...prev, 
                    type: e.target.value as PaymentAdjustment['type']
                  }))}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="commission">Comisión</option>
                  <option value="shipping">Envío</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <Label htmlFor="adjustment-amount" className="text-xs">Monto</Label>
                <Input
                  id="adjustment-amount"
                  type="number"
                  step="0.01"
                  value={newAdjustment.amount || ''}
                  onChange={(e) => setNewAdjustment(prev => ({ 
                    ...prev, 
                    amount: parseFloat(e.target.value) || 0
                  }))}
                  className="text-sm"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="adjustment-description" className="text-xs">Descripción</Label>
              <Input
                id="adjustment-description"
                value={newAdjustment.description}
                onChange={(e) => setNewAdjustment(prev => ({ 
                  ...prev, 
                  description: e.target.value
                }))}
                placeholder="Ej: Comisión de plataforma"
                className="text-sm"
              />
            </div>
            <Button
              onClick={handleAddAdjustment}
              disabled={!newAdjustment.amount || !newAdjustment.description.trim()}
              size="sm"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Ajuste
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}