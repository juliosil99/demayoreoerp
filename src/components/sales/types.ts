export interface FailedImport {
  rowData: Record<string, any>;
  reason: string;
  rowIndex: number;
}

export interface SalesImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

export interface ImportFormProps {
  isUploading: boolean;
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface FailureAlertProps {
  failedImports: FailedImport[];
  onDownload: () => void;
}
