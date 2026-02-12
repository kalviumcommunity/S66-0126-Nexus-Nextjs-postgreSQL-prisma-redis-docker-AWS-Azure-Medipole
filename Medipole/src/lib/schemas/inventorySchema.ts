import { z } from "zod";

export const inventorySchema = z.object({
  hospitalId: z.string().min(1, "hospitalId is required"),
  bloodGroup: z.string().min(1, "bloodGroup is required"),
  units: z.number().int().min(0, "units must be a non-negative integer"),
});

export type InventoryInput = z.infer<typeof inventorySchema>;
