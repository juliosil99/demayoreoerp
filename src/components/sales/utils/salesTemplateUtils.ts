
import { utils, writeFile } from "xlsx";
import { toast } from "@/components/ui/use-toast";

// Interface for failed imports
interface FailedImport {
  rowData: Record<string, any>;
  reason: string;
  rowIndex: number;
}

/**
 * Descarga un template de Excel para importación de ventas
 */
export const downloadSalesExcelTemplate = () => {
  const headers = [
    "Fecha",
    "No. Orden", 
    "Producto", 
    "SKU", 
    "Cantidad", 
    "Monto", 
    "Categoria", 
    "Nombre Proveedor", 
    "Costo", 
    "Canal", 
    "Comisión", 
    "Envío", 
    "Retención", 
    "Ganancia", 
    "Margen", 
    "Ciudad", 
    "Estado/Provincia", 
    "Código Postal", 
    "Factura", 
    "Fecha Factura", 
    "Fecha de Pago", 
    "ID Cliente", 
    "Hora",
    "Estatus de Pago"
  ];

  const exampleData = [
    {
      "Fecha": "2024-04-22",
      "No. Orden": "ORD-001",
      "Producto": "Ejemplo Producto",
      "SKU": "SKU12345",
      "Cantidad": 2,
      "Monto": 1500.00,
      "Categoria": "Electrónica",
      "Nombre Proveedor": "Proveedor S.A.",
      "Costo": 1200.00,
      "Canal": "Amazon",
      "Comisión": 50.00,
      "Envío": 30.00,
      "Retención": 0.00,
      "Ganancia": 300.00,
      "Margen": 20,
      "Ciudad": "Ciudad de México",
      "Estado/Provincia": "Ciudad de México",
      "Código Postal": "01000",
      "Factura": "F-789",
      "Fecha Factura": "2024-04-20",
      "Fecha de Pago": "2024-04-22",
      "ID Cliente": 101,
      "Hora": "13:45",
      "Estatus de Pago": "Pagado"
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

/**
 * Genera y descarga un archivo Excel con detalles de las ventas que no pudieron ser importadas
 * @param failedImports Array de objetos con los datos de las filas fallidas y los motivos
 */
export const downloadFailedImports = (failedImports: FailedImport[]) => {
  try {
    // Preparar datos para el Excel
    const reportData = failedImports.map(item => {
      // Combinar los datos originales de la fila con el motivo del error y el número de fila
      return {
        "Fila": item.rowIndex,
        "Motivo de Error": item.reason,
        ...item.rowData
      };
    });

    // Creación del Excel
    const ws = utils.json_to_sheet(reportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Errores de Importación");
    
    // Ajustar anchos de columnas
    const wscols = [
      { wch: 6 },  // Fila
      { wch: 50 }, // Motivo de Error
    ];
    
    ws['!cols'] = wscols;

    // Guardar archivo
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    writeFile(wb, `errores-importacion-ventas-${timestamp}.xlsx`);
    
    toast({
      title: "Reporte generado",
      description: "El detalle de los errores de importación se ha descargado exitosamente.",
    });
  } catch (error) {
    console.error("Error generando reporte de errores:", error);
    toast({
      title: "Error",
      description: "No se pudo generar el reporte de errores.",
      variant: "destructive",
    });
  }
};
