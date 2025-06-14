
export interface Expense {
  id: string;
  description: string;
  reconciled?: boolean;
  reconciliation_type?: string;
  expense_invoice_relations?: {
    invoice: {
      uuid: string;
      invoice_number: string;
      file_path: string;
      filename: string;
      content_type?: string;
    }
  }[];
  accounts_payable?: {
    id: string;
    client: {
      name: string;
    };
  } | null;
  contacts: { name: string; type?: string } | null;
}

export interface DownloadItem {
  filePath: string;
  fileName: string;
  contentType?: string;
  index: number;
  total: number;
}

export type LogAction = (message: string) => void;
export type ProgressUpdater = (current: number, total: number) => void;

export interface DownloadProgress {
  current: number;
  total: number;
}

export interface DownloadTask {
  id: string;
  task: () => Promise<void>;
}
