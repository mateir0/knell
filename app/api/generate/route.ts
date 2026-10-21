import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { intakeSchema } from "@/lib/schema";
import { strings } from "@/lib/strings";
import { ModelOutputError, ModelUnreachableError } from "@/lib/llm";
import { withSpan } from "@/lib/trace";
import { runGenerateWorkflow } from "@/lib/workflows";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: strings.errors.invalidIntake },
      { status: 400 },
    );
  }

  const intake = intakeSchema.safeParse(body);
  if (!intake.success) {
    return NextResponse.json(
      { error: strings.errors.invalidIntake },
      { status: 400 },
    );
  }

  if (intake.data.mode === "hackathon" && !intake.data.theme) {
    return NextResponse.json({ error: strings.run.themeRequiredError }, { status: 400 });
  }

  if (intake.data.mode === "app" && !intake.data.stack && !intake.data.knows) {
    return NextResponse.json({ error: strings.run.emptyError }, { status: 400 });
  }

  const response = await withSpan<NextResponse>(
    "knell.generate",
    "knell.generate",
    { "knell.mode": intake.data.mode },
    async () => {
      try {
        const candidates = await runGenerateWorkflow(intake.data);
        return NextResponse.json({ candidates });
      } catch (error) {
        if (error instanceof ModelUnreachableError) {
          Sentry.captureException(error);
          return NextResponse.json(
            {
              error: strings.errors.modelUnreachable,
              detail: error.message,
            },
            { status: 503 },
          );
        }

        if (error instanceof ModelOutputError) {
          Sentry.captureException(error);
          return NextResponse.json(
            {
              error: strings.errors.invalidCandidates,
              detail: error.message,
            },
            { status: 502 },
          );
        }

        Sentry.captureException(error);
        return NextResponse.json({ error: strings.errors.generic }, { status: 500 });
      }
    },
  );

  return response;
}
