import { z } from "zod";

export type VerdictKind =
  | "dead"
  | "no_demand"
  | "zombie_gap"
  | "alive"
  | "could_not_check";

export const verdictKindSchema = z.enum([
  "dead",
  "no_demand",
  "zombie_gap",
  "alive",
  "could_not_check",
]);

export type CheckResult = {
  verdict: VerdictKind;
  headline: string;
  killerName: string | null;
  killerUrl: string | null;
  receiptUrls: string[];
  cached?: boolean;
};

export const checkResultSchema = z.object({
  verdict: verdictKindSchema,
  headline: z.string(),
  killerName: z.string().nullable(),
  killerUrl: z.string().nullable(),
  receiptUrls: z.array(z.string()),
  cached: z.boolean().optional(),
});

export type EvidenceResult = {
  title: string;
  url: string;
  snippet: string;
};

export const evidenceResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  snippet: z.string(),
});

export type EvidencePack = {
  queries: { existence: string; demand: string; incumbent: string };
  results: {
    existence: EvidenceResult[];
    demand: EvidenceResult[];
    incumbent: EvidenceResult[];
  };
  excerpts: { url: string; text: string }[];
};

export const evidencePackSchema = z.object({
  queries: z.object({
    existence: z.string(),
    demand: z.string(),
    incumbent: z.string(),
  }),
  results: z.object({
    existence: z.array(evidenceResultSchema),
    demand: z.array(evidenceResultSchema),
    incumbent: z.array(evidenceResultSchema),
  }),
  excerpts: z.array(
    z.object({
      url: z.string(),
      text: z.string(),
    }),
  ),
});
