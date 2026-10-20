import { z } from "zod";

export const hackathonTimeValues = [
  "a weekend",
  "one week",
  "two+ weeks",
] as const;

export const appTimeValues = ["a weekend", "a few weeks", "ongoing side project"] as const;

export const goalValues = [
  "make money",
  "get users",
  "learn and portfolio",
  "just fun",
] as const;

export const platformValues = ["web", "mobile", "either"] as const;

export const hackathonIntakeSchema = z.object({
  mode: z.literal("hackathon"),
  theme: z.string().trim().default(""),
  about: z.string().trim().optional().default(""),
  time: z.enum(hackathonTimeValues).optional(),
});

export const appIntakeSchema = z.object({
  mode: z.literal("app"),
  stack: z.string().trim().default(""),
  knows: z.string().trim().default(""),
  time: z.enum(appTimeValues).optional(),
  goal: z.enum(goalValues).optional(),
  platform: z.enum(platformValues).optional(),
});

export const intakeSchema = z.discriminatedUnion("mode", [
  hackathonIntakeSchema,
  appIntakeSchema,
]);

export type HackathonIntake = z.infer<typeof hackathonIntakeSchema>;
export type AppIntake = z.infer<typeof appIntakeSchema>;
export type Intake = z.infer<typeof intakeSchema>;

export const candidateSchema = z.object({
  name: z.string().trim().min(1),
  oneLiner: z.string().trim().min(1),
  whoItsFor: z.string().trim().min(1),
  workItRemoves: z.string().trim().min(1),
  buildShape: z.string().trim().min(1),
});

export const candidateListSchema = z.array(candidateSchema).length(8);

export type Candidate = z.infer<typeof candidateSchema>;
