
import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductSearchResult } from "@/types/product-search";
import { toast } from "@/components/ui/use-toast";
import { downloadInvoiceFile } from "@/utils/invoiceDownload";
import { generateInvoicePdf } from "@/services/invoicePdfService";

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
        console.log(`Searching for products with term: "${searchQuery}"`);
        let query = supabase
          .from("invoice_products")
          .select(`
            *,
            invoice:invoices!invoice_id (
              id,
              invoice_number,
              serie,
              invoice_date,
              stamp_date,
              issuer_name,
              issuer_rfc,
              file_path,
              filename,
              receiver_name,
              receiver_rfc,
              uuid
            )
          `)
          .ilike("description", `%${searchQuery}%`);

        // Add date range filter if applicable
        if (startDate) {
          const startDateStr = startDate.toISOString().split("T")[0];
          console.log(`Adding start date filter: ${startDateStr}`);
          query = query.gte("invoices.invoice_date", startDateStr);
        }
        if (endDate) {
          const endDateStr = endDate.toISOString().split("T")[0];
          console.log(`Adding end date filter: ${endDateStr}`);
          query = query.lte("invoices.invoice_date", endDateStr);
        }

        const { data, error } = await query.order('invoice_date', {
          foreignTable: 'invoices',
          ascending: false,
        });

        if (error) {
          console.error("Database error searching products:", error);
          throw error;
        }

        console.log(`Found ${data?.length || 0} products matching "${searchQuery}"`);
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
      console.log(`Downloading XML for invoice ID: ${invoiceId}`);
      const { data: invoice, error } = await supabase
        .from("invoices")
        .select("file_path, filename")
        .eq("id", invoiceId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching invoice data:", error);
        throw new Error("No se encontró la información de la factura");
      }
      
      if (!invoice?.file_path) {
        console.error("XML file path not found for invoice:", invoiceId);
        throw new Error("No se encontró la ruta del archivo XML");
      }

      console.log("Downloading file:", invoice.file_path);
      await downloadInvoiceFile(invoice.file_path, invoice.filename);

      toast({
        title: "Descarga exitosa",
        description: "El archivo XML se ha descargado correctamente.",
      });
    } catch (error) {
      console.error("Error downloading XML:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo descargar el archivo XML.",
        variant: "destructive",
      });
    }
  }, []);

  const generatePdf = useCallback(async (invoiceId: number, issuerRfc: string) => {
    try {
      console.log(`Initiating PDF generation for invoice ID: ${invoiceId}, RFC: ${issuerRfc}`);
      
      if (!invoiceId) {
        console.error("Missing invoice ID for PDF generation");
        throw new Error("Falta el ID de la factura para generar el PDF");
      }
      
      // Generate the PDF with the improved generator function
      const result = await generateInvoicePdf(invoiceId, issuerRfc);
      
      if (!result.success) {
        console.error("PDF generation failed:", result.error);
        throw new Error(result.error || "Error generando PDF");
      }
      
      console.log("PDF generation successful");
      toast({
        title: "PDF generado",
        description: `El PDF "${result.filename}" se ha generado y descargado correctamente.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: typeof error === "string" ? error : 
          error instanceof Error ? error.message : 
          "No se pudo generar el PDF.",
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
