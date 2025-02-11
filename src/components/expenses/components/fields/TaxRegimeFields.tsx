
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
import type { BaseFieldProps } from "../types";

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

export function TaxRegimeFields({ formData, setFormData }: BaseFieldProps) {
  return (
    <>
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
    </>
  );
}
