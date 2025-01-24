import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, FileX } from "lucide-react";
import { toast } from "sonner";

const Invoices = () => {
  const [uploading, setUploading] = useState(false);

  const { data: invoices, refetch } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const parseXMLContent = (xmlContent: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    
    // Get the root comprobante element
    const comprobante = xmlDoc.getElementsByTagName("cfdi:Comprobante")[0];
    const emisor = xmlDoc.getElementsByTagName("cfdi:Emisor")[0];
    const receptor = xmlDoc.getElementsByTagName("cfdi:Receptor")[0];
    const timbreFiscal = xmlDoc.getElementsByTagName("tfd:TimbreFiscalDigital")[0];

    return {
      uuid: timbreFiscal?.getAttribute("UUID") || null,
      serie: comprobante?.getAttribute("Serie") || null,
      invoice_number: comprobante?.getAttribute("Folio") || null,
      invoice_date: comprobante?.getAttribute("Fecha") || null,
      total_amount: parseFloat(comprobante?.getAttribute("Total") || "0"),
      currency: comprobante?.getAttribute("Moneda") || null,
      payment_method: comprobante?.getAttribute("MetodoPago") || null,
      payment_form: comprobante?.getAttribute("FormaPago") || null,
      subtotal: parseFloat(comprobante?.getAttribute("SubTotal") || "0"),
      exchange_rate: parseFloat(comprobante?.getAttribute("TipoCambio") || "1"),
      issuer_rfc: emisor?.getAttribute("Rfc") || null,
      issuer_name: emisor?.getAttribute("Nombre") || null,
      issuer_tax_regime: emisor?.getAttribute("RegimenFiscal") || null,
      receiver_rfc: receptor?.getAttribute("Rfc") || null,
      receiver_name: receptor?.getAttribute("Nombre") || null,
      receiver_tax_regime: receptor?.getAttribute("RegimenFiscalReceptor") || null,
      receiver_cfdi_use: receptor?.getAttribute("UsoCFDI") || null,
      receiver_zip_code: receptor?.getAttribute("DomicilioFiscalReceptor") || null,
      certificate_number: comprobante?.getAttribute("NoCertificado") || null,
      stamp_date: timbreFiscal?.getAttribute("FechaTimbrado") || null,
      sat_certificate_number: timbreFiscal?.getAttribute("NoCertificadoSAT") || null,
      cfdi_stamp: timbreFiscal?.getAttribute("SelloCFD") || null,
      sat_stamp: timbreFiscal?.getAttribute("SelloSAT") || null,
    };
  };

  const checkDuplicateUUID = async (uuid: string | null) => {
    if (!uuid) return false;
    
    const { data, error } = await supabase
      .from("Invoices")
      .select("id")
      .eq("uuid", uuid)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking for duplicate UUID:", error);
      return false;
    }

    return !!data;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setUploading(true);
      let successCount = 0;
      let errorCount = 0;
      let duplicateCount = 0;

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check if file is XML
        if (!file.type.includes("xml")) {
          errorCount++;
          continue;
        }

        try {
          // Read the XML file content
          const xmlContent = await file.text();

          // Parse XML and extract CFDI data
          const cfdiData = parseXMLContent(xmlContent);

          // Check for duplicate UUID
          const isDuplicate = await checkDuplicateUUID(cfdiData.uuid);
          if (isDuplicate) {
            duplicateCount++;
            continue;
          }

          // Upload file to Supabase Storage
          const fileExt = file.name.split(".").pop();
          const filePath = `${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("invoices")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Create invoice record with CFDI data
          const { error: dbError } = await supabase.from("Invoices").insert({
            filename: file.name,
            file_path: filePath,
            content_type: file.type,
            size: file.size,
            xml_content: xmlContent,
            ...cfdiData,
          });

          if (dbError) throw dbError;

          successCount++;
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully processed ${successCount} invoice(s)`);
        refetch();
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to process ${errorCount} file(s)`);
      }

      if (duplicateCount > 0) {
        toast.warning(`Skipped ${duplicateCount} duplicate invoice(s)`);
      }

    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error uploading and processing files");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".xml"
            onChange={handleFileUpload}
            multiple
            disabled={uploading}
            className="max-w-xs"
          />
          <Button disabled={uploading}>
            {uploading ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload XML
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Issuer</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileX className="h-4 w-4" />
                      {invoice.filename}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.created_at || "").toLocaleDateString()}
                  </TableCell>
                  <TableCell>{invoice.invoice_number || "-"}</TableCell>
                  <TableCell>{invoice.issuer_name || "-"}</TableCell>
                  <TableCell>{invoice.receiver_name || "-"}</TableCell>
                  <TableCell>
                    {invoice.total_amount
                      ? `${invoice.currency || "MXN"} ${invoice.total_amount.toFixed(2)}`
                      : "-"}
                  </TableCell>
                  <TableCell>{invoice.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
