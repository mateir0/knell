import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";
import { buildJudgeMessages } from "../lib/judge";
import type { Candidate } from "../lib/schema";
import type { CheckResult, EvidencePack } from "../lib/verdict";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

async function loadEnvFile(fileName: string): Promise<void> {
  let content: string;
  try {
    content = await readFile(path.join(repoRoot, fileName), "utf8");
  } catch {
    return;
  }
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

async function main(): Promise<void> {
  await loadEnvFile(".env.local");
  await loadEnvFile(".env");

  const uri = (process.env.MONGODB_URI ?? "").trim();
  if (uri === "") {
    console.error(
      "MONGODB_URI is not set. Add it to .env.local (see .env.example) and run again.",
    );
    process.exitCode = 1;
    return;
  }
  const dbName = (process.env.MONGODB_DB ?? "").trim() || "knell";

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
  await client.connect();

  try {
    const docs = await client
      .db(dbName)
      .collection("verdicts")
      .find({})
      .toArray();

    const lines: string[] = [];
    const byVerdict: Record<string, number> = {};
    let skipped = 0;

    for (const doc of docs) {
      const candidate = doc.candidate as Candidate | undefined;
      const queries = doc.queries as EvidencePack["queries"] | undefined;
      const evidence = doc.evidence as
        | { results: EvidencePack["results"]; excerpts?: EvidencePack["excerpts"] }
        | undefined;
      const result = doc.result as CheckResult | undefined;

      if (
        !candidate ||
        !queries ||
        !evidence?.results ||
        !result ||
        result.verdict === "could_not_check"
      ) {
        skipped += 1;
        continue;
      }

      const pack: EvidencePack = {
        queries,
        results: evidence.results,
        excerpts: evidence.excerpts ?? [],
      };
      const messages = buildJudgeMessages(candidate, pack);
      const assistant = JSON.stringify({
        verdict: result.verdict,
        headline: result.headline,
        killerName: result.killerName ?? null,
        killerUrl: result.killerUrl ?? null,
        receiptUrls: result.receiptUrls ?? [],
      });

      lines.push(
        JSON.stringify({
          messages: [...messages, { role: "assistant", content: assistant }],
        }),
      );
      byVerdict[result.verdict] = (byVerdict[result.verdict] ?? 0) + 1;
    }

    if (lines.length === 0) {
      console.log(
        `No real verdicts found in ${dbName}.verdicts — run a sweep first so the judge has something to learn from.`,
      );
      return;
    }

    const outDir = path.join(repoRoot, "scripts", "out");
    await mkdir(outDir, { recursive: true });

    const datasetPath = path.join(outDir, "judge-dataset.jsonl");
    await writeFile(datasetPath, `${lines.join("\n")}\n`, "utf8");

    const metaPath = path.join(outDir, "judge-dataset.meta.json");
    await writeFile(
      metaPath,
      `${JSON.stringify(
        {
          total: lines.length,
          byVerdict,
          skipped,
          source: `${dbName}.verdicts`,
          exportedAt: new Date().toISOString(),
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    console.log(
      `Exported ${lines.length} verdicts to ${path.relative(repoRoot, datasetPath)} (${skipped} skipped) — meta in ${path.relative(repoRoot, metaPath)}.`,
    );
    for (const [kind, count] of Object.entries(byVerdict).sort()) {
      console.log(`  ${kind}: ${count}`);
    }
  } finally {
    await client.close();
  }
}

void main().catch((error: unknown) => {
  console.error(
    `Export failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
