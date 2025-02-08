
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  rfc: z.string().min(12, "RFC must be at least 12 characters"),
  phone: z.string().optional(),
  type: z.enum(["client", "supplier"]),
  tax_regime: z.string().min(1, "Tax regime is required"),
  postal_code: z.string().min(5, "Postal code must be 5 digits"),
  address: z.string().optional(),
});

