
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BaseFieldProps, SelectOption } from "../types";

interface Props extends BaseFieldProps {
  suppliers: SelectOption[];
  onSupplierSelect?: (supplierId: string, defaultChartAccountId?: string) => void;
}

export function PaymentSupplierFields({ formData, setFormData, suppliers, onSupplierSelect }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  
  // Filter suppliers based on search term
  const filteredSuppliers = safeSuppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to fetch supplier's default chart account
  const fetchSupplierDefaultChartAccount = async (supplierId: string) => {
    if (!supplierId || supplierId === "none") return;
    
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("default_chart_account_id")
        .eq("id", supplierId)
        .single();
      
      if (error) {
        return;
      }
      
      if (data && data.default_chart_account_id && onSupplierSelect) {
        onSupplierSelect(supplierId, data.default_chart_account_id);
      } else if (onSupplierSelect) {
        onSupplierSelect(supplierId);
      }
    } catch (error) {
      // Silent error handling
    }
  };

  // Handle supplier selection
  const handleSupplierChange = (value: string) => {
    const newValue = value === "none" ? undefined : value;
    setFormData({ ...formData, supplier_id: newValue });
    
    if (value !== "none") {
      fetchSupplierDefaultChartAccount(value);
    }
  };

  return (
    <>
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
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Buscar proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            value={formData.supplier_id || "none"}
            onValueChange={handleSupplierChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar proveedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ninguno</SelectItem>
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={String(supplier.id)}>
                    {supplier.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no_results" disabled>No se encontraron proveedores</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
