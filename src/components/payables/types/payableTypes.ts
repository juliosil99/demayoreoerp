
import { z } from "zod";
import { payableFormSchema } from "../schema/payableSchema";

export type PayableFormData = z.infer<typeof payableFormSchema>;
