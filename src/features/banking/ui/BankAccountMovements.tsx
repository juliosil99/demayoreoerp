
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function BankAccountMovements() {
  const { accountId } = useParams();
  const { user } = useAuth();
  const [account, setAccount] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      if (!accountId) return;

      try {
        // Fetch account details
        const { data: accountData, error: accountError } = await supabase
          .from("bank_accounts")
          .select("*")
          .eq("id", accountId)
          .single();

        if (accountError) throw accountError;
        setAccount(accountData);

        // Fetch account movements (expenses)
        const { data: expensesData, error: expensesError } = await supabase
          .from("expenses")
          .select("*")
          .eq("account_id", accountId)
          .order("date", { ascending: false });

        if (expensesError) throw expensesError;

        // Fetch deposits (payments)
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select("*")
          .eq("account_id", accountId)
          .order("date", { ascending: false });

        if (paymentsError) throw paymentsError;

        // Combine and sort movements
        const allMovements = [
          ...expensesData.map((expense: any) => ({
            ...expense,
            type: "expense",
            movement_date: expense.date
          })),
          ...paymentsData.map((payment: any) => ({
            ...payment,
            type: "payment",
            movement_date: payment.date
          }))
        ];

        // Sort by date, newest first
        allMovements.sort((a, b) => 
          new Date(b.movement_date).getTime() - new Date(a.movement_date).getTime()
        );

        setMovements(allMovements);
      } catch (error) {
        console.error("Error fetching account details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountDetails();
  }, [accountId, user]);

  if (loading) {
    return <div>Loading account details...</div>;
  }

  if (!account) {
    return <div>Account not found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Movimientos de Cuenta</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{account.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Cuenta</p>
              <p>{account.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Moneda</p>
              <p>{account.currency}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="font-bold">{formatCurrency(account.balance)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Balance</p>
              <p>{new Date(account.balance_date).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((movement) => (
                  <tr key={`${movement.type}-${movement.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(movement.movement_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {movement.type === 'expense' ? movement.description : 
                       movement.type === 'payment' ? `Pago: ${movement.reference_number || 'Sin referencia'}` : 
                       'Movimiento'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {movement.type === 'expense' ? 'Gasto' : 
                       movement.type === 'payment' ? 'Ingreso' : 
                       'Otro'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                      movement.type === 'expense' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {movement.type === 'expense' ? `-${formatCurrency(movement.amount)}` : 
                       formatCurrency(movement.amount)}
                    </td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay movimientos para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
