
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { SalesImportDialog } from "@/components/sales/SalesImportDialog";
import { SalesHeader } from "@/components/sales/components/SalesHeader";
import { SalesMetrics } from "@/components/sales/components/SalesMetrics";
import { SalesTable } from "@/components/sales/components/SalesTable";

const ITEMS_PER_PAGE = 50;

const Sales = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const { data: sales, refetch } = useQuery({
    queryKey: ["sales", currentPage, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("Sales")
        .select("*");

      if (searchTerm) {
        query = query.ilike("orderNumber", `%${searchTerm}%`);
      }

      // First, get the count using the correct method
      const { data: countData, error: countError } = await supabase
        .from("Sales")
        .select("id", { count: "exact" })
        .ilike(searchTerm ? "orderNumber" : "id", searchTerm ? `%${searchTerm}%` : "%")
        .count();
      
      if (countError) {
        console.error("Error fetching count:", countError);
        throw countError;
      }
      
      setTotalCount(countData || 0);

      // Then, get the paginated data
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await query
        .order("date", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching sales:", error);
        throw error;
      }

      return data || [];
    },
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const totalSales = sales?.reduce((acc, sale) => acc + (sale.price || 0), 0) || 0;
  const totalProfit = sales?.reduce((acc, sale) => acc + (sale.Profit || 0), 0) || 0;
  const averageMargin = sales?.reduce((acc, sale) => acc + (sale.profitMargin || 0), 0) / (sales?.length || 1) || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <SalesHeader 
        onImportClick={() => setImportDialogOpen(true)}
        onSearch={handleSearch}
      />
      
      <SalesImportDialog
        isOpen={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportSuccess={() => refetch()}
      />

      <SalesMetrics 
        totalSales={totalSales}
        totalProfit={totalProfit}
        averageMargin={averageMargin}
      />

      <Card>
        <CardContent className="overflow-x-auto">
          <SalesTable
            sales={sales || []}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
