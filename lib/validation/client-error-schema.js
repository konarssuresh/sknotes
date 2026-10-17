import { z } from "zod";

export const clientErrorReportSchema = z.object({
  route: z.string().max(512).optional(),
  message: z.string().max(500),
  digest: z.string().max(128).optional(),
  lastApiRequestId: z.string().max(128).optional(),
  swVersion: z.string().max(64).optional(),
  buildId: z.string().max(64).optional(),
});
