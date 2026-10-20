import { createHash } from "node:crypto";

const WINDOW_MS = 3_600_000;
const PER_CLIENT_LIMIT = 16;
const GLOBAL_LIMIT = 40;

type HitLists = Map<string, number[]>;

const store = globalThis as typeof globalThis & {
  __knellRateLimits?: HitLists;
};

function hitLists(): HitLists {
  store.__knellRateLimits ??= new Map<string, number[]>();
  return store.__knellRateLimits;
}

function prune(list: number[], now: number): number[] {
  return list.filter((timestamp) => now - timestamp < WINDOW_MS);
}

export function consumeCheck(clientKey: string): boolean {
  const lists = hitLists();
  const now = Date.now();

  const clientHits = prune(lists.get(clientKey) ?? [], now);
  const globalHits = prune(lists.get("__global__") ?? [], now);

  if (clientHits.length >= PER_CLIENT_LIMIT || globalHits.length >= GLOBAL_LIMIT) {
    lists.set(clientKey, clientHits);
    lists.set("__global__", globalHits);
    return false;
  }

  lists.set(clientKey, [...clientHits, now]);
  lists.set("__global__", [...globalHits, now]);
  return true;
}

export function clientKeyFrom(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const firstForwarded = forwarded ? forwarded.split(",")[0]?.trim() : "";
  const raw =
    firstForwarded || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(raw).digest("hex");
}
