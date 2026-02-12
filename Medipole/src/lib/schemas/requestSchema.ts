import { z } from "zod";

export const requestSchema = z.object({
  hospitalId: z.string().min(1, "hospitalId is required"),
  bloodGroup: z.string().min(1, "bloodGroup is required"),
  unitsRequired: z.number().int().min(1, "unitsRequired must be at least 1"),
  details: z.string().optional(),
});

export type RequestInput = z.infer<typeof requestSchema>;
