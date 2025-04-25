
import { FailedImport } from "../types";

export const handleImportError = (
  rowData: Record<string, any>,
  reason: string,
  rowIndex: number,
  failedImports: FailedImport[]
) => {
  failedImports.push({
    rowData,
    reason,
    rowIndex
  });
};
