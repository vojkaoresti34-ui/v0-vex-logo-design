import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  headline: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  currentRole: z.string().optional(),
  targetRole: z.string().optional(),
  yearsExperience: z.number().int().min(0).max(50).optional(),
  salaryMin: z.number().int().optional(),
  salaryMax: z.number().int().optional(),
  jobTypes: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

// All string fields are `.nullish()` (accept string | null | undefined) because the
// onboarding wizard initializes unselected fields as `null`. The service layer
// (UserService.completeOnboarding) already coerces null/empty to safe defaults.
const optionalStr = z.string().nullish();

export const onboardingSchema = z.object({
  goal: z.string().nullish(),
  currentRole: optionalStr,
  employmentStatus: optionalStr,
  yearsExperience: optionalStr,
  startDate: optionalStr,
  country: optionalStr,
  workAuth: optionalStr,
  targetRole: optionalStr,
  environment: optionalStr,
  jobType: optionalStr,
  targetSalary: optionalStr,
  industries: optionalStr,
  biggestWin: optionalStr,
  tone: optionalStr,
  blacklistCompanies: z.array(z.string()).nullish(),
  skills: optionalStr,
  languages: optionalStr,
  linkedinUrl: optionalStr,
  githubUrl: optionalStr,
});
