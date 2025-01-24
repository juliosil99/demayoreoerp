import { supabase } from "@/integrations/supabase/client";
import { parseXMLContent } from "./xml-parser";

const checkDuplicateUUID = async (uuid: string | null) => {
  if (!uuid) return false;
  
  const { data, error } = await supabase
    .from("invoices")
    .select("id")
    .eq("uuid", uuid)
    .maybeSingle();

  if (error) {
    console.error("Error checking for duplicate UUID:", error);
    return false;
  }

  return !!data;
};

export const processInvoiceFile = async (file: File, xmlContent: string) => {
  const cfdiData = parseXMLContent(xmlContent);
  const isDuplicate = await checkDuplicateUUID(cfdiData.uuid);
  
  if (isDuplicate) {
    return { success: false, isDuplicate: true };
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("invoices")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    return { success: false, isDuplicate: false };
  }

  // First insert the invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      filename: file.name,
      file_path: filePath,
      content_type: file.type,
      size: file.size,
      xml_content: xmlContent,
      ...cfdiData,
    })
    .select()
    .single();

  if (invoiceError) {
    console.error("Error inserting invoice data:", invoiceError);
    return { success: false, isDuplicate: false };
  }

  // Then insert the products if any
  if (cfdiData.products && cfdiData.products.length > 0) {
    const productsWithInvoiceId = cfdiData.products.map(product => ({
      ...product,
      invoice_id: invoice.id
    }));

    const { error: productsError } = await supabase
      .from("invoice_products")
      .insert(productsWithInvoiceId);

    if (productsError) {
      console.error("Error inserting product data:", productsError);
      // We don't return false here since the invoice was already created
    }
  }

  return { success: true, isDuplicate: false };
};