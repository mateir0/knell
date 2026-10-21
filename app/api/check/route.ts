import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { candidateSchema } from "@/lib/schema";
import { strings } from "@/lib/strings";
import {
  SearchBudgetExhaustedError,
  SearchNotConfiguredError,
} from "@/lib/evidence";
import { ModelUnreachableError } from "@/lib/llm";
import { findVerdict, recordVerdict } from "@/lib/graveyard";
import { clientKeyFrom, consumeCheck } from "@/lib/rate-limit";
import { withSpan } from "@/lib/trace";
import { unchecked } from "@/lib/validate";
import { runCheckWorkflow } from "@/lib/workflows";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

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

  const response = await withSpan<NextResponse>(
    "knell.check",
    "knell.check",
    { "knell.candidate.name": candidate.data.name },
    async (span) => {
      const cached = await findVerdict(candidate.data.name);
      if (cached) {
        span.setAttribute("knell.verdict", cached.verdict);
        span.setAttribute("knell.cached", true);
        return NextResponse.json({ ...cached, cached: true });
      }

      if (!consumeCheck(clientKeyFrom(request))) {
        span.setAttribute("knell.verdict", "could_not_check");
        span.setAttribute("knell.cached", false);
        return NextResponse.json(unchecked(strings.errors.rateLimited));
      }

      try {
        const outcome = await runCheckWorkflow(candidate.data);
        span.setAttribute("knell.verdict", outcome.served.verdict);
        span.setAttribute("knell.cached", false);

        if (outcome.served.verdict === "could_not_check") {
          if (outcome.served.headline === strings.errors.judgeNoProof) {
            Sentry.captureException(
              new Error("the judge returned a verdict without proof"),
            );
          }
          return NextResponse.json(outcome.served);
        }

        await recordVerdict(outcome.candidate, outcome.pack, outcome.served);
        return NextResponse.json(outcome.served);
      } catch (error) {
        span.setAttribute("knell.verdict", "could_not_check");
        span.setAttribute("knell.cached", false);
        if (error instanceof SearchNotConfiguredError) {
          Sentry.captureException(error);
          return NextResponse.json(unchecked(strings.errors.searchNotConfigured));
        }
        if (error instanceof SearchBudgetExhaustedError) {
          Sentry.captureException(error);
          return NextResponse.json(unchecked(strings.errors.searchExhausted));
        }
        if (error instanceof ModelUnreachableError) {
          Sentry.captureException(error);
          return NextResponse.json(unchecked(strings.errors.modelUnreachable));
        }
        Sentry.captureException(error);
        return NextResponse.json(unchecked(strings.errors.judgeNoProof));
      }
    },
  );

  return response;
}
