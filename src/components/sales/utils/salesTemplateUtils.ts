
import { utils, writeFile } from "xlsx";
import { toast } from "@/components/ui/use-toast";

/**
 * Descarga un template de Excel para importación de ventas
 */
export const downloadSalesExcelTemplate = () => {
  const headers = [
    "Fecha",
    "No. Orden",
    "Producto",
    "ID Cliente",
    "Monto",
    "Ganancia",
    "Estado",
    "SKU",
    "Cantidad",
    "Canal",
    "Costo",
    "Margen",
    "Comisión",
    "Retención",
    "Envío",
    "Categoría",
    "Nombre Proveedor",
    "Factura",
    "Fecha Factura",
    "Fecha de Pago",
    "Hora",
    "Ciudad",
    "Estado/Provincia",
    "Código Postal"
  ];

  const exampleData = [
    {
      "Fecha": "2024-04-22",
      "No. Orden": "ORD-001",
      "Producto": "Ejemplo Producto",
      "ID Cliente": 101,
      "Monto": 1500.00,
      "Ganancia": 300.00,
      "Estado": "paid",
      "SKU": "SKU12345",
      "Cantidad": 2,
      "Canal": "Amazon",
      "Costo": 1200.00,
      "Margen": 20,
      "Comisión": 50.00,
      "Retención": 0.00,
      "Envío": 30.00,
      "Categoría": "Electrónica",
      "Nombre Proveedor": "Proveedor S.A.",
      "Factura": "F-789",
      "Fecha Factura": "2024-04-20",
      "Fecha de Pago": "2024-04-22",
      "Hora": "13:45",
      "Ciudad": "Ciudad de México",
      "Estado/Provincia": "CDMX",
      "Código Postal": "01000"
    }
  ];

  const ws = utils.json_to_sheet(exampleData, { header: headers });
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Ventas");

  try {
    writeFile(wb, "plantilla_ventas.xlsx");
    toast({
      title: "Plantilla descargada",
      description: "La plantilla de ventas se descargó exitosamente.",
    });
  } catch (error) {
    console.error("Error generando plantilla ventas:", error);
    toast({
      title: "Error",
      description: "No se pudo generar la plantilla.",
      variant: "destructive",
    });
  }
};
