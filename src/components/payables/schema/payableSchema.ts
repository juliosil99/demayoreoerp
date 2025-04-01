
import { z } from "zod";

export const payableFormSchema = z.object({
  client_id: z.string().min(1, "Proveedor es requerido"),
  invoice_id: z.number().nullable(),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  due_date: z.date(),
  payment_term: z.number(),
  notes: z.string().nullable()
});
