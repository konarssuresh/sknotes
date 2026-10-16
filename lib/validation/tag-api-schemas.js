import { z } from "zod";

export const createTagBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const renameTagBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
});
