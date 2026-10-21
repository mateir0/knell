export type VerdictKind =
  | "dead"
  | "no_demand"
  | "zombie_gap"
  | "alive"
  | "could_not_check";

export type CheckResult = {
  verdict: VerdictKind;
  headline: string;
  killerName: string | null;
  killerUrl: string | null;
  receiptUrls: string[];
  cached?: boolean;
};

export type EvidenceResult = {
  title: string;
  url: string;
  snippet: string;
};

export type EvidencePack = {
  queries: { existence: string; demand: string; incumbent: string };
  results: {
    existence: EvidenceResult[];
    demand: EvidenceResult[];
    incumbent: EvidenceResult[];
  };
  excerpts: { url: string; text: string }[];
};
