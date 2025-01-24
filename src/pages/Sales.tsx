import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DollarSign, Receipt, Calendar } from "lucide-react";

const Sales = () => {
  console.log("Sales component rendering");
  const [isLoading, setIsLoading] = useState(true);

  const { data: sales } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Sales")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching sales:", error);
        throw error;
      }

      return data;
    },
  });

  const totalSales = sales?.reduce((acc, sale) => acc + (sale.price || 0), 0) || 0;
  const totalProfit = sales?.reduce((acc, sale) => acc + (sale.Profit || 0), 0) || 0;
  const averageMargin = sales?.reduce((acc, sale) => acc + (sale.profitMargin || 0), 0) / (sales?.length || 1) || 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales Overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalProfit.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Margin</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMargin.toFixed(2)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales?.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{new Date(sale.date || "").toLocaleDateString()}</TableCell>
                  <TableCell>{sale.orderNumber}</TableCell>
                  <TableCell>{sale.productName}</TableCell>
                  <TableCell>{sale.idClient}</TableCell>
                  <TableCell className="text-right">${sale.price?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell className="text-right">${sale.Profit?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>{sale.statusPaid}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;