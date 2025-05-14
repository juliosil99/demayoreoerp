
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
  try {
    console.log("Processing invoice file:", file.name);
    const cfdiData = parseXMLContent(xmlContent);
    
    // Check if there was an error in parsing
    if (cfdiData.error) {
      console.error("Error parsing XML content:", cfdiData.errorMessage);
      return { success: false, isDuplicate: false, error: cfdiData.errorMessage };
    }
    
    const isDuplicate = await checkDuplicateUUID(cfdiData.uuid);
    
    if (isDuplicate) {
      console.log("Duplicate invoice detected with UUID:", cfdiData.uuid);
      return { success: false, isDuplicate: true };
    }

    const fileExt = file.name.split(".").pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading file to storage:", uploadError);
      return { success: false, isDuplicate: false, error: uploadError.message };
    }

    // First insert the invoice without the products
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        filename: file.name,
        file_path: filePath,
        content_type: file.type,
        size: file.size,
        xml_content: xmlContent,
        certificate_number: cfdiData.certificate_number,
        cfdi_stamp: cfdiData.cfdi_stamp,
        currency: cfdiData.currency,
        exchange_rate: cfdiData.exchange_rate,
        invoice_date: cfdiData.invoice_date,
        invoice_number: cfdiData.invoice_number,
        invoice_type: cfdiData.invoice_type,
        issuer_name: cfdiData.issuer_name,
        issuer_rfc: cfdiData.issuer_rfc,
        issuer_tax_regime: cfdiData.issuer_tax_regime,
        payment_form: cfdiData.payment_form,
        payment_method: cfdiData.payment_method,
        receiver_cfdi_use: cfdiData.receiver_cfdi_use,
        receiver_name: cfdiData.receiver_name,
        receiver_rfc: cfdiData.receiver_rfc,
        receiver_tax_regime: cfdiData.receiver_tax_regime,
        receiver_zip_code: cfdiData.receiver_zip_code,
        sat_certificate_number: cfdiData.sat_certificate_number,
        sat_stamp: cfdiData.sat_stamp,
        serie: cfdiData.serie,
        stamp_date: cfdiData.stamp_date,
        subtotal: cfdiData.subtotal,
        tax_amount: cfdiData.tax_amount,
        total_amount: cfdiData.total_amount,
        uuid: cfdiData.uuid,
        version: cfdiData.version,
        status: 'completed'
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Error inserting invoice data:", invoiceError);
      return { success: false, isDuplicate: false, error: invoiceError.message };
    }

    console.log("Invoice record created successfully with ID:", invoice?.id);

    // Then insert the products if any
    if (cfdiData.products && cfdiData.products.length > 0) {
      const productsWithInvoiceId = cfdiData.products.map(product => ({
        invoice_id: invoice.id,
        description: product.description,
        quantity: product.quantity,
        unit: product.unit,
        unit_value: product.unitValue,
        amount: product.amount,
        product_key: product.productKey,
        unit_key: product.unitKey
      }));

      const { error: productsError } = await supabase
        .from("invoice_products")
        .insert(productsWithInvoiceId);

      if (productsError) {
        console.error("Error inserting product data:", productsError);
        // We don't return false here since the invoice was already created
      } else {
        console.log(`Successfully inserted ${productsWithInvoiceId.length} products for invoice ID ${invoice.id}`);
      }
    } else {
      console.log("No products found in the invoice XML");
    }

    return { success: true, isDuplicate: false };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing invoice:", errorMessage);
    return { success: false, isDuplicate: false, error: errorMessage };
  }
};
