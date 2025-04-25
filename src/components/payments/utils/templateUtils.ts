
import { utils, WorkBook, write } from "xlsx";

export const downloadOrdersTemplate = () => {
  const wb: WorkBook = utils.book_new();
  const ws = utils.aoa_to_sheet([
    ["Número de Orden"], // Header
    ["ORD-001"],        // Example row
    ["ORD-002"],        // Example row
  ]);

  utils.book_append_sheet(wb, ws, "Órdenes");
  
  const wbout = write(wb, { 
    bookType: "xlsx", 
    type: "binary"
  });
  
  const buf = new ArrayBuffer(wbout.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;
  
  const blob = new Blob([buf], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla_ordenes.xlsx";
  a.click();
  window.URL.revokeObjectURL(url);
};
