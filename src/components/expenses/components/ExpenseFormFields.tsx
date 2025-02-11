
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaxDetailsFields } from "./TaxDetailsFields";
import type { ExpenseFormData } from "../hooks/useExpenseForm";

interface ExpenseFormFieldsProps {
  formData: ExpenseFormData;
  setFormData: (data: ExpenseFormData) => void;
  bankAccounts: any[];
  chartAccounts: any[];
  suppliers: any[];
}

const TAX_REGIMES = [
  { value: "601", label: "General de Ley Personas Morales" },
  { value: "603", label: "Personas Morales con Fines no Lucrativos" },
  { value: "605", label: "Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { value: "606", label: "Arrendamiento" },
  { value: "607", label: "Régimen de Enajenación o Adquisición de Bienes" },
  { value: "608", label: "Demás ingresos" },
  { value: "609", label: "Consolidación" },
  { value: "610", label: "Residentes en el Extranjero sin Establecimiento Permanente en México" },
  { value: "611", label: "Ingresos por Dividendos (socios y accionistas)" },
  { value: "612", label: "Personas Físicas con Actividades Empresariales y Profesionales" },
  { value: "614", label: "Ingresos por intereses" },
  { value: "615", label: "Régimen de los ingresos por obtención de premios" },
  { value: "616", label: "Sin obligaciones fiscales" },
  { value: "620", label: "Sociedades Cooperativas de Producción que optan por diferir sus ingresos" },
  { value: "621", label: "Incorporación Fiscal" },
  { value: "622", label: "Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
  { value: "623", label: "Opcional para Grupos de Sociedades" },
  { value: "624", label: "Coordinados" },
  { value: "625", label: "Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
  { value: "626", label: "Régimen Simplificado de Confianza" },
];

export function ExpenseFormFields({
  formData,
  setFormData,
  bankAccounts,
  chartAccounts,
  suppliers,
}: ExpenseFormFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Monto</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Descripción</Label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Cuenta Bancaria</Label>
          <Select
            value={formData.account_id}
            onValueChange={(value) => setFormData({ ...formData, account_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cuenta" />
            </SelectTrigger>
            <SelectContent>
              {bankAccounts?.map((account) => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Cuenta de Gasto</Label>
          <Select
            value={formData.chart_account_id}
            onValueChange={(value) => setFormData({ ...formData, chart_account_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cuenta de gasto" />
            </SelectTrigger>
            <SelectContent>
              {chartAccounts?.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.code} - {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Método de Pago</Label>
          <Select
            value={formData.payment_method}
            onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar método de pago" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Efectivo</SelectItem>
              <SelectItem value="transfer">Transferencia</SelectItem>
              <SelectItem value="check">Cheque</SelectItem>
              <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Proveedor</Label>
          <Select
            value={formData.supplier_id}
            onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar proveedor" />
            </SelectTrigger>
            <SelectContent>
              {suppliers?.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Régimen Fiscal</Label>
          <Select
            value={formData.tax_regime}
            onValueChange={(value) => setFormData({ ...formData, tax_regime: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar régimen fiscal" />
            </SelectTrigger>
            <SelectContent>
              {TAX_REGIMES.map((regime) => (
                <SelectItem key={regime.value} value={regime.value}>
                  {regime.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Número de Referencia</Label>
          <Input
            value={formData.reference_number}
            onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-2 pt-4">
          <Checkbox
            id="is_deductible"
            checked={formData.is_deductible}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, is_deductible: checked as boolean })
            }
          />
          <Label htmlFor="is_deductible">Es deducible</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notas</Label>
        <Input
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Detalles de Impuestos</Label>
        <TaxDetailsFields
          taxDetails={formData.tax_details}
          onChange={(taxDetails) => setFormData({ ...formData, tax_details: taxDetails })}
        />
      </div>
    </div>
  );
}
