
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductSearchResult } from "@/types/product-search";
import { toast } from "@/components/ui/use-toast";
import { downloadInvoiceXml } from "@/utils/invoiceDownload";
import { generateInvoicePdf } from "@/services/pdfGenerator";

export const useProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() - 3))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ["product-search", searchQuery, startDate, endDate],
    queryFn: async () => {
      if (!searchQuery) return [];

      try {
        const query = supabase
          .from("invoice_products")
          .select(`
            *,
            invoice:invoices!invoice_id (
              id,
              invoice_number,
              serie,
              invoice_date,
              issuer_name,
              issuer_rfc,
              file_path,
              receiver_name,
              receiver_rfc
            )
          `)
          .ilike("description", `%${searchQuery}%`);

        // Add date range filter if applicable
        if (startDate) {
          query.gte("invoices.invoice_date", startDate.toISOString().split("T")[0]);
        }
        if (endDate) {
          query.lte("invoices.invoice_date", endDate.toISOString().split("T")[0]);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        return data as ProductSearchResult[];
      } catch (error) {
        console.error("Error searching products:", error);
        toast({
          title: "Error",
          description: "Hubo un error al buscar productos. Intenta de nuevo.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!searchQuery,
  });

  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa un término de búsqueda.",
      });
      return;
    }
    setSearchQuery(searchTerm.trim());
  }, [searchTerm]);

  const downloadXml = useCallback(async (invoiceId: number) => {
    try {
      const { data: invoice } = await supabase
        .from("invoices")
        .select("file_path, filename")
        .eq("id", invoiceId)
        .single();

      if (!invoice?.file_path) {
        throw new Error("No se encontró el archivo XML de la factura");
      }

      await downloadInvoiceXml(invoice.file_path, invoice.filename);

      toast({
        title: "Descarga exitosa",
        description: "El archivo XML se ha descargado correctamente.",
      });
    } catch (error) {
      console.error("Error downloading XML:", error);
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo XML.",
        variant: "destructive",
      });
    }
  }, []);

  const generatePdf = useCallback(async (invoiceId: number, issuerRfc: string) => {
    try {
      const result = await generateInvoicePdf(invoiceId, issuerRfc);
      
      if (!result.success) {
        throw new Error(result.error || "Error generando PDF");
      }
      
      toast({
        title: "PDF generado",
        description: "El PDF se ha generado y descargado correctamente.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: typeof error === "string" ? error : "No se pudo generar el PDF.",
        variant: "destructive",
      });
    }
  }, []);

  return {
    products,
    isLoading,
    searchTerm,
    setSearchTerm,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleSearch,
    downloadXml,
    generatePdf,
  };
};
