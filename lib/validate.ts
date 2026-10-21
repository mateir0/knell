import { strings } from "./strings";
import type { CheckResult, EvidencePack } from "./verdict";

export function unchecked(headline: string): CheckResult {
  return {
    verdict: "could_not_check",
    headline,
    killerName: null,
    killerUrl: null,
    receiptUrls: [],
  };
}

export function validateVerdict(
  verdict: CheckResult,
  pack: EvidencePack,
): CheckResult {
  if (verdict.verdict === "could_not_check") {
    return verdict;
  }

  const evidenceUrls = new Set<string>();
  for (const key of ["existence", "demand", "incumbent"] as const) {
    for (const entry of pack.results[key]) {
      evidenceUrls.add(entry.url);
    }
  }

  const headline = verdict.headline.trim();
  if (headline === "") {
    return unchecked(strings.errors.judgeNoProof);
  }

  if (
    verdict.receiptUrls.length === 0 ||
    !verdict.receiptUrls.every((url) => evidenceUrls.has(url))
  ) {
    return unchecked(strings.errors.judgeNoProof);
  }

  if (verdict.verdict === "dead" || verdict.verdict === "zombie_gap") {
    if (
      verdict.killerUrl == null ||
      !evidenceUrls.has(verdict.killerUrl) ||
      verdict.killerName == null
    ) {
      return unchecked(strings.errors.judgeNoProof);
    }
    return { ...verdict, headline };
  }

  return { ...verdict, headline, killerName: null, killerUrl: null };
}
