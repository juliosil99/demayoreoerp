
import { AccountCurrency } from "../types";

export interface Account {
  id: number;
  name: string;
  balance: number;
  currency: AccountCurrency;
}

export interface TransferFormData {
  date: string;
  from_account_id: string;
  to_account_id: string;
  amount_from: string;
  amount_to: string;
  exchange_rate: string;
  reference_number: string;
  notes: string;
}

export interface FormFieldProps {
  formData: TransferFormData;
  setFormData: React.Dispatch<React.SetStateAction<TransferFormData>>;
}
