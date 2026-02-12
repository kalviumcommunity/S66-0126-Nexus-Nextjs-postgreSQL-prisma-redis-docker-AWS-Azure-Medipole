import { z } from "zod";

export const donorSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  bloodGroup: z.string().min(1, "bloodGroup is required"),
  phone: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type DonorInput = z.infer<typeof donorSchema>;
