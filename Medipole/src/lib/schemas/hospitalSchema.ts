import { z } from "zod";

export const hospitalSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  name: z.string().min(2, "Name must be at least 2 characters long"),
  address: z.string().min(5, "Address must be at least 5 characters long"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type HospitalInput = z.infer<typeof hospitalSchema>;
