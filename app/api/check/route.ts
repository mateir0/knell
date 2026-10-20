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
import type { CheckResult } from "@/lib/verdict";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

  try {
    const queries = await writeQueries(candidate.data);
    const pack = await buildEvidence(candidate.data, queries);
    const verdict = await judgeCandidate(candidate.data, pack);

    const evidenceUrls = new Set<string>();
    for (const key of ["existence", "demand", "incumbent"] as const) {
      for (const entry of pack.results[key]) {
        evidenceUrls.add(entry.url);
      }
    }

    const receiptsHeld = verdict.receiptUrls.every((url) =>
      evidenceUrls.has(url),
    );
    const killerHeld =
      verdict.verdict === "dead" || verdict.verdict === "zombie_gap"
        ? verdict.killerUrl != null && evidenceUrls.has(verdict.killerUrl)
        : true;

    return NextResponse.json(
      receiptsHeld && killerHeld ? verdict : unchecked(strings.errors.judgeNoProof),
    );
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
