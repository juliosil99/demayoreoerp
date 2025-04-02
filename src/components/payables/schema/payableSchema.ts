
import { z } from "zod";

export const payableFormSchema = z.object({
  client_id: z.string().min(1, "Proveedor es requerido"),
  invoice_id: z.number().nullable(),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  due_date: z.date(),
  payment_term: z.number(),
  notes: z.string().nullable(),
  chart_account_id: z.string().nullable().optional(),
  // Recurring payment fields
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.string().nullable().optional(),
  recurrence_day: z.number().nullable().optional(),
  recurrence_end_date: z.date().nullable().optional()
});

