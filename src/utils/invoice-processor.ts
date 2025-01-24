import { supabase } from "@/integrations/supabase/client";
import { parseXMLContent } from "./xml-parser";

const checkDuplicateUUID = async (uuid: string | null) => {
  if (!uuid) return false;
  
  const { data, error } = await supabase
    .from("Invoices")
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

  const { error: dbError } = await supabase.from("Invoices").insert({
    filename: file.name,
    file_path: filePath,
    content_type: file.type,
    size: file.size,
    xml_content: xmlContent,
    ...cfdiData,
  });

  if (dbError) {
    console.error("Error inserting invoice data:", dbError);
    return { success: false, isDuplicate: false };
  }

  return { success: true, isDuplicate: false };
};