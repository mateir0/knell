import { NextResponse } from "next/server";
import { candidateSchema } from "@/lib/schema";
import { strings } from "@/lib/strings";
import {
  buildEvidence,
  SearchBudgetExhaustedError,
  SearchNotConfiguredError,
} from "@/lib/evidence";
import { judgeCandidate, writeQueries } from "@/lib/judge";
import { ModelUnreachableError } from "@/lib/llm";
import { findVerdict, recordVerdict } from "@/lib/graveyard";
import { clientKeyFrom, consumeCheck } from "@/lib/rate-limit";
import type { CheckResult } from "@/lib/verdict";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function unchecked(headline: string): CheckResult {
  return {
    verdict: "could_not_check",
    headline,
    killerName: null,
    killerUrl: null,
    receiptUrls: [],
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: strings.errors.generic },
      { status: 400 },
    );
  }

  const candidate = candidateSchema.safeParse(
    (body as { candidate?: unknown } | null)?.candidate,
  );
  if (!candidate.success) {
    return NextResponse.json(
      { error: strings.errors.generic },
      { status: 400 },
    );
  }

  const cached = await findVerdict(candidate.data.name);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  if (!consumeCheck(clientKeyFrom(request))) {
    return NextResponse.json(unchecked(strings.errors.rateLimited));
  }

  try {
    const queries = await writeQueries(candidate.data);
    const pack = await buildEvidence(candidate.data, queries);
    const verdict = await judgeCandidate(candidate.data, pack);

    if (verdict.verdict === "could_not_check") {
      return NextResponse.json(verdict);
    }

    const evidenceUrls = new Set<string>();
    for (const key of ["existence", "demand", "incumbent"] as const) {
      for (const entry of pack.results[key]) {
        evidenceUrls.add(entry.url);
      }
    }

    const headline = verdict.headline.trim();
    if (headline === "") {
      return NextResponse.json(unchecked(strings.errors.judgeNoProof));
    }

    if (
      verdict.receiptUrls.length === 0 ||
      !verdict.receiptUrls.every((url) => evidenceUrls.has(url))
    ) {
      return NextResponse.json(unchecked(strings.errors.judgeNoProof));
    }

    let served: CheckResult;
    if (verdict.verdict === "dead" || verdict.verdict === "zombie_gap") {
      if (
        verdict.killerUrl == null ||
        !evidenceUrls.has(verdict.killerUrl) ||
        verdict.killerName == null
      ) {
        return NextResponse.json(unchecked(strings.errors.judgeNoProof));
      }
      served = { ...verdict, headline };
    } else {
      served = { ...verdict, headline, killerName: null, killerUrl: null };
    }

    await recordVerdict(candidate.data, pack, served);

    return NextResponse.json(served);
  } catch (error) {
    if (error instanceof SearchNotConfiguredError) {
      return NextResponse.json(unchecked(strings.errors.searchNotConfigured));
    }
    if (error instanceof SearchBudgetExhaustedError) {
      return NextResponse.json(unchecked(strings.errors.searchExhausted));
    }
    if (error instanceof ModelUnreachableError) {
      return NextResponse.json(unchecked(strings.errors.modelUnreachable));
    }
    return NextResponse.json(unchecked(strings.errors.judgeNoProof));
  }
}
