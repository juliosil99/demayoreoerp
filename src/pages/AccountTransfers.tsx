
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeftIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AccountTransfers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    from_account_id: "",
    to_account_id: "",
    amount: "",
    reference_number: "",
    notes: "",
  });

  const { data: accounts } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createTransfer = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("account_transfers")
        .insert({
          ...data,
          amount: parseFloat(data.amount),
          from_account_id: parseInt(data.from_account_id),
          to_account_id: parseInt(data.to_account_id),
          user_id: user?.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      toast.success("Transferencia realizada con éxito");
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        from_account_id: "",
        to_account_id: "",
        amount: "",
        reference_number: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error("Error al realizar la transferencia: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.from_account_id === formData.to_account_id) {
      toast.error("Las cuentas de origen y destino deben ser diferentes");
      return;
    }
    createTransfer.mutate(formData);
  };

  const handleBack = () => {
    navigate("/accounting/banking");
  };

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        onClick={handleBack}
        className="mb-4"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Volver a Cuentas Bancarias
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Nueva Transferencia</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Monto</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-2">
                <Label>Cuenta Origen</Label>
                <Select
                  value={formData.from_account_id}
                  onValueChange={(value) => setFormData({ ...formData, from_account_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name} - ${account.balance?.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center md:col-span-1">
                <ArrowRight className="h-6 w-6" />
              </div>

              <div className="md:col-span-2">
                <Label>Cuenta Destino</Label>
                <Select
                  value={formData.to_account_id}
                  onValueChange={(value) => setFormData({ ...formData, to_account_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name} - ${account.balance?.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Número de Referencia</Label>
              <Input
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                placeholder="Número de referencia (opcional)"
              />
            </div>

            <div>
              <Label>Notas</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales (opcional)"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={createTransfer.isPending}
            >
              {createTransfer.isPending ? "Procesando..." : "Realizar Transferencia"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
