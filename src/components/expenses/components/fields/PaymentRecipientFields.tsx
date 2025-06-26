
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
import type { SelectOption } from "../types";

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  recipients: SelectOption[];
  onRecipientSelect?: (recipientId: string, defaultChartAccountId?: string) => void;
}

export function PaymentRecipientFields({ formData, setFormData, recipients, onRecipientSelect }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const safeRecipients = Array.isArray(recipients) ? recipients : [];
  
  // Filter recipients based on search term
  const filteredRecipients = safeRecipients.filter(recipient => 
    recipient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group recipients by type
  const groupedRecipients: { [key: string]: SelectOption[] } = {
    supplier: [],
    employee: []
  };
  
  filteredRecipients.forEach(recipient => {
    if (recipient.type === 'supplier' || recipient.type === 'employee') {
      groupedRecipients[recipient.type].push(recipient);
    }
  });

  // Function to fetch recipient's default chart account
  const fetchRecipientDefaultChartAccount = async (recipientId: string) => {
    if (!recipientId || recipientId === "none") return;
    
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("default_chart_account_id")
        .eq("id", recipientId)
        .single();
      
      if (error) {
        return;
      }
      
      if (data && data.default_chart_account_id && onRecipientSelect) {
        onRecipientSelect(recipientId, data.default_chart_account_id);
      } else if (onRecipientSelect) {
        onRecipientSelect(recipientId);
      }
    } catch (error) {
      // Silent error handling
    }
  };

  // Handle recipient selection
  const handleRecipientChange = (value: string) => {
    const newValue = value === "none" ? undefined : value;
    setFormData({ ...formData, supplier_id: newValue });
    
    if (value !== "none") {
      fetchRecipientDefaultChartAccount(value);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Destinatario del Pago</Label>
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Buscar proveedor o empleado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          value={formData.supplier_id || "none"}
          onValueChange={handleRecipientChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar destinatario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Ninguno</SelectItem>
            
            {groupedRecipients.supplier.length > 0 && (
              <>
                <SelectItem value="supplier_group" disabled className="font-semibold">Proveedores</SelectItem>
                {groupedRecipients.supplier.map((supplier) => (
                  <SelectItem key={supplier.id} value={String(supplier.id)}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </>
            )}
            
            {groupedRecipients.employee.length > 0 && (
              <>
                <SelectItem value="employee_group" disabled className="font-semibold">Empleados</SelectItem>
                {groupedRecipients.employee.map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    {employee.name}
                  </SelectItem>
                ))}
              </>
            )}
            
            {filteredRecipients.length === 0 && (
              <SelectItem value="no_results" disabled>No se encontraron resultados</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
