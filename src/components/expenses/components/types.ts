
import type { ExpenseFormData } from "../hooks/useExpenseForm";

export interface BaseFieldProps {
  formData: ExpenseFormData;
  setFormData: (data: ExpenseFormData) => void;
}

export interface SelectOption {
  id: string | number;
  name: string;
  code?: string;
  type?: string;  // Added this property
}
