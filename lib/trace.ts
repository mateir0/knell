import * as Sentry from "@sentry/nextjs";

type SpanHandle = {
  setAttribute(key: string, value: unknown): unknown;
};

type SpanAttributes = Record<string, string | number | boolean | undefined>;

function dsnConfigured(): boolean {
  return (process.env.SENTRY_DSN ?? "").trim() !== "";
}

function safeSystem(baseUrl: string): string {
  try {
    return new URL(baseUrl).host;
  } catch {
    return baseUrl;
  }
}

export function genAiAttributes(model: string, baseUrl: string): SpanAttributes {
  return {
    "gen_ai.request.model": model,
    "gen_ai.system": safeSystem(baseUrl),
  };
}

export function withSpan<T>(
  name: string,
  op: string,
  attributes: SpanAttributes | null,
  fn: (span: SpanHandle) => T | Promise<T>,
): T | Promise<T> {
  if (!dsnConfigured()) {
    return fn({ setAttribute: () => undefined });
  }
  return Sentry.startSpan({ name, op, attributes: attributes ?? {} }, (span) =>
    fn(span as SpanHandle),
  );
}
