import { z } from "zod";

export const screenshotRequestSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  quality: z.enum(["high", "medium"]).default("high"),
  deviceFrame: z.enum(["laptop", "mobile"]).default("laptop")
});

export const screenshotResponseSchema = z.object({
  id: z.string(),
  url: z.string(),
  mockupUrl: z.string(),
  dimensions: z.object({
    width: z.number(),
    height: z.number()
  }),
  fileSize: z.number(),
  createdAt: z.string()
});

export type ScreenshotRequest = z.infer<typeof screenshotRequestSchema>;
export type ScreenshotResponse = z.infer<typeof screenshotResponseSchema>;
