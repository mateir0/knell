import { MongoClient, type Collection } from "mongodb";
import type { EvidencePack, CheckResult } from "./verdict";
import type { Candidate } from "./schema";
import { withSpan } from "./trace";

export type GraveEntry = {
  name: string;
  result: CheckResult;
  createdAt: string;
};

type GraveDocument = {
  key: string;
  name: string;
  candidate: Candidate;
  queries: EvidencePack["queries"];
  evidence: {
    results: EvidencePack["results"];
    excerpts: EvidencePack["excerpts"];
  };
  result: CheckResult;
  createdAt: Date;
};

const MONGODB_URI = process.env.MONGODB_URI?.trim() ?? "";
const MONGODB_DB = process.env.MONGODB_DB?.trim() || "knell";
const MAX_TIME_MS = 3_000;

const VERDICT_KINDS: readonly string[] = [
  "dead",
  "no_demand",
  "zombie_gap",
  "alive",
  "could_not_check",
];

const store = globalThis as typeof globalThis & {
  __knellMongoClient?: Promise<MongoClient>;
};

let indexEnsured = false;

function isEnabled(): boolean {
  return MONGODB_URI !== "";
}

function clientPromise(): Promise<MongoClient> {
  store.__knellMongoClient ??= new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: MAX_TIME_MS,
  }).connect();
  return store.__knellMongoClient;
}

async function getCollection(): Promise<Collection<GraveDocument> | null> {
  if (!isEnabled()) {
    return null;
  }
  try {
    const client = await clientPromise();
    const collection = client.db(MONGODB_DB).collection<GraveDocument>("verdicts");
    if (!indexEnsured) {
      indexEnsured = true;
      void collection
        .createIndex({ key: 1 }, { unique: true })
        .catch(() => {});
    }
    return collection;
  } catch {
    return null;
  }
}

export function graveKey(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, " ").trim();
}

function isCheckResult(value: unknown): value is CheckResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Record<string, unknown>;
  if (
    typeof result.verdict !== "string" ||
    !VERDICT_KINDS.includes(result.verdict)
  ) {
    return false;
  }
  if (typeof result.headline !== "string") {
    return false;
  }
  if (!Array.isArray(result.receiptUrls)) {
    return false;
  }
  return true;
}

export async function findVerdict(name: string): Promise<CheckResult | null> {
  return await withSpan<CheckResult | null>(
    "knell.graveyard",
    "knell.graveyard",
    null,
    async (span) => {
      try {
        const collection = await getCollection();
        if (!collection) {
          span.setAttribute("knell.graveyard.hit", false);
          return null;
        }
        const doc = await collection.findOne(
          { key: graveKey(name) },
          { maxTimeMS: MAX_TIME_MS },
        );
        const result = doc?.result;
        const found = isCheckResult(result) ? result : null;
        span.setAttribute("knell.graveyard.hit", found !== null);
        return found;
      } catch {
        span.setAttribute("knell.graveyard.hit", false);
        return null;
      }
    },
  );
}

export async function recordVerdict(
  candidate: Candidate,
  pack: EvidencePack,
  result: CheckResult,
): Promise<void> {
  await withSpan<void>(
    "knell.graveyard",
    "knell.graveyard",
    { "knell.verdict": result.verdict },
    async () => {
      try {
        if (!isEnabled() || result.verdict === "could_not_check") {
          return;
        }
        const collection = await getCollection();
        if (!collection) {
          return;
        }
        await collection.updateOne(
          { key: graveKey(candidate.name) },
          {
            $setOnInsert: {
              key: graveKey(candidate.name),
              name: candidate.name,
              candidate,
              queries: pack.queries,
              evidence: { results: pack.results, excerpts: pack.excerpts },
              result,
              createdAt: new Date(),
            },
          },
          { upsert: true, maxTimeMS: MAX_TIME_MS },
        );
      } catch {
        return;
      }
    },
  );
}

export async function listGraves(limit = 60): Promise<GraveEntry[]> {
  try {
    const collection = await getCollection();
    if (!collection) {
      return [];
    }
    const docs = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .project({
        name: 1,
        result: 1,
        createdAt: 1,
      })
      .maxTimeMS(MAX_TIME_MS)
      .toArray();

    return docs.flatMap((doc) => {
      if (typeof doc.name !== "string" || !isCheckResult(doc.result)) {
        return [];
      }
      const createdAt = doc.createdAt instanceof Date ? doc.createdAt : null;
      return [
        {
          name: doc.name,
          result: doc.result,
          createdAt: createdAt ? createdAt.toISOString() : "",
        },
      ];
    });
  } catch {
    return [];
  }
}
