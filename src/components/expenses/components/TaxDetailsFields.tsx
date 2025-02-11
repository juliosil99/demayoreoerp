
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { TaxDetails } from "../hooks/useExpenseForm";

interface TaxDetailsFieldsProps {
  taxDetails: TaxDetails;
  onChange: (taxDetails: TaxDetails) => void;
}

export function TaxDetailsFields({ taxDetails, onChange }: TaxDetailsFieldsProps) {
  const handleTaxChange = (
    taxType: 'iva' | 'isr' | 'ieps',
    category: 'transferred' | 'retained' | 'creditable',
    field: 'rate' | 'amount',
    value: string
  ) => {
    const newValue = parseFloat(value) || 0;
    const newTaxDetails = { ...taxDetails };

    if (taxType === 'iva' && category in newTaxDetails.iva) {
      (newTaxDetails.iva[category] as any)[field] = newValue;
    } else if (taxType === 'isr' && category === 'retained') {
      newTaxDetails.isr.retained[field] = newValue;
    } else if (taxType === 'ieps' && (category === 'transferred' || category === 'retained')) {
      newTaxDetails.ieps[category][field] = newValue;
    }

    onChange(newTaxDetails);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">IVA</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Trasladado</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm">Tasa %</Label>
                <Input
                  type="number"
                  value={taxDetails.iva.transferred.rate}
                  onChange={(e) => handleTaxChange('iva', 'transferred', 'rate', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm">Monto</Label>
                <Input
                  type="number"
                  value={taxDetails.iva.transferred.amount}
                  onChange={(e) => handleTaxChange('iva', 'transferred', 'amount', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Retenido</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm">Tasa %</Label>
                <Input
                  type="number"
                  value={taxDetails.iva.retained.rate}
                  onChange={(e) => handleTaxChange('iva', 'retained', 'rate', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm">Monto</Label>
                <Input
                  type="number"
                  value={taxDetails.iva.retained.amount}
                  onChange={(e) => handleTaxChange('iva', 'retained', 'amount', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Acreditable</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm">Tasa %</Label>
                <Input
                  type="number"
                  value={taxDetails.iva.creditable.rate}
                  onChange={(e) => handleTaxChange('iva', 'creditable', 'rate', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm">Monto</Label>
                <Input
                  type="number"
                  value={taxDetails.iva.creditable.amount}
                  onChange={(e) => handleTaxChange('iva', 'creditable', 'amount', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">ISR</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Retenido</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm">Tasa %</Label>
                <Input
                  type="number"
                  value={taxDetails.isr.retained.rate}
                  onChange={(e) => handleTaxChange('isr', 'retained', 'rate', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm">Monto</Label>
                <Input
                  type="number"
                  value={taxDetails.isr.retained.amount}
                  onChange={(e) => handleTaxChange('isr', 'retained', 'amount', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">IEPS</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Trasladado</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm">Tasa %</Label>
                <Input
                  type="number"
                  value={taxDetails.ieps.transferred.rate}
                  onChange={(e) => handleTaxChange('ieps', 'transferred', 'rate', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm">Monto</Label>
                <Input
                  type="number"
                  value={taxDetails.ieps.transferred.amount}
                  onChange={(e) => handleTaxChange('ieps', 'transferred', 'amount', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Retenido</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm">Tasa %</Label>
                <Input
                  type="number"
                  value={taxDetails.ieps.retained.rate}
                  onChange={(e) => handleTaxChange('ieps', 'retained', 'rate', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm">Monto</Label>
                <Input
                  type="number"
                  value={taxDetails.ieps.retained.amount}
                  onChange={(e) => handleTaxChange('ieps', 'retained', 'amount', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
