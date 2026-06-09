import { z } from "zod";

export const createApplicationSchema = z.object({
  company: z.string().min(1, "Company is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobUrl: z.string().url().optional().or(z.literal("")),
  jobId: z.string().optional(),
  resumeId: z.string().optional(),
  coverLetterId: z.string().optional(),
  status: z.enum(["SAVED", "APPLIED", "SCREENING", "INTERVIEWING", "TECHNICAL", "OFFERED", "ACCEPTED", "REJECTED", "WITHDRAWN"]).optional(),
  notes: z.string().optional(),
  salary: z.string().optional(),
  source: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial().extend({
  appliedAt: z.string().optional(),
  nextAction: z.string().optional(),
  nextActionDate: z.string().optional(),
  contacts: z.any().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["SAVED", "APPLIED", "SCREENING", "INTERVIEWING", "TECHNICAL", "OFFERED", "ACCEPTED", "REJECTED", "WITHDRAWN"]),
  notes: z.string().optional(),
});
