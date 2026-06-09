import { z } from "zod";

export const createResumeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  template: z.string().optional(),
  language: z.string().optional(),
});

export const updateResumeSchema = z.object({
  title: z.string().optional(),
  parsedContent: z.any().optional(),
  template: z.string().optional(),
  isDefault: z.boolean().optional(),
  language: z.string().optional(),
});

export const atsAnalyzeSchema = z.object({
  resumeId: z.string(),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters"),
});
