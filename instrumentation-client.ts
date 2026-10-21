import * as Sentry from "@sentry/nextjs";

const dsn = (process.env.NEXT_PUBLIC_SENTRY_DSN ?? "").trim();

Sentry.init({
  dsn: dsn === "" ? undefined : dsn,
  enabled: dsn !== "",
  tracesSampleRate: dsn === "" ? 0 : 1.0,
});
