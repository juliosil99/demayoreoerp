
import { z } from "zod";

export const itemSchema = z.object({
  category: z.string().min(1, "La categoría es requerida"),
  description: z.string().optional(),
  amount: z.coerce.number().positive("El monto debe ser mayor que cero"),
  type: z.enum(['inflow', 'outflow']),
  source: z.enum(['historical', 'ai_predicted', 'manual', 'recurring', 'reconciled']),
  is_recurring: z.boolean().default(false),
});

export type ItemFormValues = z.infer<typeof itemSchema>;
