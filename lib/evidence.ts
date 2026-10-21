import type { Candidate } from "./schema";
import type { EvidencePack, EvidenceResult } from "./verdict";

export class SearchNotConfiguredError extends Error {}
export class SearchBudgetExhaustedError extends Error {}

const SEARCH_TIMEOUT_MS = 10_000;
const EXCERPT_TIMEOUT_MS = 6_000;
const EXCERPT_MAX_CHARS = 2_000;

export async function searchSerp(query: string): Promise<EvidenceResult[]> {
  const apiKey = process.env.SERPAPI_API_KEY?.trim();
  if (!apiKey) {
    throw new SearchNotConfiguredError("SERPAPI_API_KEY is not set");
  }

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("num", "5");
  url.searchParams.set("api_key", apiKey);

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
    });

    if (response.status === 429) {
      throw new SearchBudgetExhaustedError("the search budget is exhausted");
    }
    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as {
      organic_results?: Array<{
        title?: unknown;
        link?: unknown;
        snippet?: unknown;
      }>;
    };

    const organic = Array.isArray(payload?.organic_results)
      ? payload.organic_results
      : [];

    return organic
      .slice(0, 5)
      .map((entry) => ({
        title: typeof entry.title === "string" ? entry.title : "",
        url: typeof entry.link === "string" ? entry.link : "",
        snippet: typeof entry.snippet === "string" ? entry.snippet : "",
      }))
      .filter((entry) => entry.url !== "");
  } catch (error) {
    if (error instanceof SearchBudgetExhaustedError) {
      throw error;
    }
    return [];
  }
}

export async function fetchExcerpt(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(EXCERPT_TIMEOUT_MS),
    });
    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text.slice(0, EXCERPT_MAX_CHARS);
  } catch {
    return null;
  }
}

async function searchSerper(query: string): Promise<EvidenceResult[] | null> {
  const apiKey = process.env.SERPER_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({ q: query, num: 5 }),
      cache: "no-store",
      signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as {
      organic?: Array<{
        title?: unknown;
        link?: unknown;
        snippet?: unknown;
      }>;
    };

    const organic = Array.isArray(payload?.organic) ? payload.organic : [];

    return organic
      .slice(0, 5)
      .map((entry) => ({
        title: typeof entry.title === "string" ? entry.title : "",
        url: typeof entry.link === "string" ? entry.link : "",
        snippet: typeof entry.snippet === "string" ? entry.snippet : "",
      }))
      .filter((entry) => entry.url !== "");
  } catch {
    return [];
  }
}

async function searchSlot(query: string): Promise<EvidenceResult[]> {
  if (process.env.SERPAPI_API_KEY?.trim()) {
    let budgetError: SearchBudgetExhaustedError | null = null;
    try {
      const serpResults = await searchSerp(query);
      if (serpResults.length > 0) {
        return serpResults;
      }
    } catch (error) {
      if (error instanceof SearchBudgetExhaustedError) {
        budgetError = error;
      }
    }

    const serperResults = await searchSerper(query);
    if (serperResults) {
      return serperResults;
    }
    if (budgetError) {
      throw budgetError;
    }
    return [];
  }

  const serperResults = await searchSerper(query);
  if (serperResults) {
    return serperResults;
  }
  throw new SearchNotConfiguredError("no search provider is configured");
}

export async function buildEvidence(
  candidate: Candidate,
  queries: EvidencePack["queries"],
): Promise<EvidencePack> {
  const slots = await Promise.all([
    searchSlot(queries.existence),
    searchSlot(queries.demand),
    searchSlot(queries.incumbent),
  ]);

  const results = {
    existence: slots[0] ?? [],
    demand: slots[1] ?? [],
    incumbent: slots[2] ?? [],
  };

  const fetched = new Set<string>();
  const targets: string[] = [];
  const collect = (slots: EvidenceResult[], count: number) => {
    for (const entry of slots.slice(0, count)) {
      if (!fetched.has(entry.url)) {
        fetched.add(entry.url);
        targets.push(entry.url);
      }
    }
  };
  collect(results.existence, 2);
  collect(results.demand, 1);

  const fetchedExcerpts = await Promise.all(
    targets.slice(0, 3).map((url) => fetchExcerpt(url)),
  );

  const excerpts: EvidencePack["excerpts"] = fetchedExcerpts.flatMap(
    (text, index) => (text ? [{ url: targets[index], text }] : []),
  );

  return { queries, results, excerpts };
}
