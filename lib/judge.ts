import {
  LLM_API_KEY,
  LLM_BASE_URL,
  LLM_MODEL,
  ModelOutputError,
  ModelUnreachableError,
} from "./llm";
import type { Candidate } from "./schema";
import type { CheckResult, EvidencePack, VerdictKind } from "./verdict";
import { genAiAttributes, withSpan } from "./trace";

export const JUDGE_BASE_URL = process.env.JUDGE_BASE_URL || LLM_BASE_URL;
export const JUDGE_MODEL = process.env.JUDGE_MODEL || LLM_MODEL;
export const JUDGE_API_KEY = process.env.JUDGE_API_KEY || LLM_API_KEY;

export const JUDGE_TEMPERATURE = (() => {
  const parsed = Number(process.env.JUDGE_TEMPERATURE);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 2 ? parsed : 0.2;
})();

const REQUEST_TIMEOUT_MS = 90_000;
const WRITER_TIMEOUT_MS = 20_000;

export type ChatMessage = {
  role: "system" | "user";
  content: string;
};

const QUERY_SYSTEM_PROMPT = `You are the writer half of Knell, a product checker.
For one candidate idea you write the web searches that will surface evidence.

Output contract — breaking any of these makes the answer unusable:
- Reply with a single JSON object and NOTHING else. No prose, no preamble, no markdown, no code fences.
- The object has exactly these three string keys: "existence", "demand", "incumbent".
- "existence": a web search query that would find whether a product like this already exists.
- "demand": a web search query that would find whether anyone is actually asking for this.
- "incumbent": a web search query that would find the leading existing product for this job and whether it is still maintained.
- Each value is one search query, written from the candidate's name, its one-liner and who it is for.`;

const JUDGE_SYSTEM_PROMPT = `You are the judge half of Knell, a product fact-checker.
You receive one candidate idea plus web evidence (search results and page excerpts) and return one verdict.

The four verdicts:
- "dead": a real product already does this exact job for this exact user, and it is alive and maintained. Say what it is in the headline.
- "no_demand": the demand evidence shows nobody asking for this. Nobody searches for it, nobody complains about the chore it removes. Say what is absent in the headline.
- "zombie_gap": a product does exist for this job, but the incumbent is abandoned, unmaintained or neglected. Name the incumbent in the headline.
- "alive": there is no real incumbent and genuine demand signals exist. Sum up the opening in the headline.

Output contract — breaking any of these makes the answer unusable:
- Reply with a single JSON object and NOTHING else. No prose, no preamble, no markdown, no code fences.
- The object has exactly five keys: "verdict", "headline", "killerName", "killerUrl", "receiptUrls".
- "verdict": one of "dead", "no_demand", "zombie_gap", "alive", "could_not_check".
- "headline": at most 140 characters. For dead/no_demand it is the cause; for zombie_gap/alive it is the opening.
- For "dead" and "zombie_gap": "killerName" and "killerUrl" name the incumbent and must not be null. For every other verdict both are null.
- "receiptUrls": an array of URLs copied EXACTLY from the evidence URLs provided below — every accepted part of the verdict must be traceable to one of them.
- If the evidence does not prove the verdict, reply "could_not_check" with an empty receiptUrls. Never guess.`;

const STRICT_SUFFIX = `

STRICT OUTPUT CHECK — your previous reply could not be parsed:
- Reply with the raw JSON object only. The first character of your reply must be "{" and the last must be "}".
- No markdown fences, no commentary, no trailing text.
- Keep the exact key set demanded above.`;

function authHeaders(apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const trimmed = apiKey.trim();
  if (trimmed) {
    headers.Authorization = `Bearer ${trimmed}`;
  }
  return headers;
}

async function chatSlot(
  baseUrl: string,
  model: string,
  apiKey: string,
  temperature: number,
  messages: ChatMessage[],
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<string> {
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(apiKey),
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        stream: false,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new ModelUnreachableError(
      error instanceof Error ? error.message : "request to the model failed",
    );
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new ModelUnreachableError(
      `model endpoint responded ${response.status}: ${detail.slice(0, 300)}`,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new ModelUnreachableError(
      error instanceof Error ? error.message : "model endpoint returned no JSON",
    );
  }

  const content = (payload as {
    choices?: Array<{ message?: { content?: unknown } }>;
  })?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || content.trim() === "") {
    throw new ModelOutputError("model returned an empty completion");
  }

  return content;
}

function parseJsonObject(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced?.[1] ?? trimmed;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    const parsed = JSON.parse(body.slice(start, end + 1)) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function userBrief(candidate: Candidate): string {
  return `CANDIDATE:
- name: ${candidate.name}
- what it is: ${candidate.oneLiner}
- who it is for: ${candidate.whoItsFor}
- the chore it removes: ${candidate.workItRemoves}
- build shape: ${candidate.buildShape}`;
}

async function askSlot(
  systemPrompt: string,
  userPrompt: string,
  slot: {
    baseUrl: string;
    model: string;
    apiKey: string;
    temperature: number;
    timeoutMs: number;
  },
): Promise<Record<string, unknown>> {
  const first = await chatSlot(
    slot.baseUrl,
    slot.model,
    slot.apiKey,
    slot.temperature,
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    slot.timeoutMs,
  );

  const parsed = parseJsonObject(first);
  if (parsed) return parsed;

  const second = await chatSlot(
    slot.baseUrl,
    slot.model,
    slot.apiKey,
    slot.temperature,
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: `${userPrompt}${STRICT_SUFFIX}` },
    ],
    slot.timeoutMs,
  );

  const retried = parseJsonObject(second);
  if (retried) return retried;

  throw new ModelOutputError("the model did not return a usable JSON object");
}

export async function writeQueries(
  candidate: Candidate,
): Promise<EvidencePack["queries"]> {
  try {
    const reply = await withSpan<string>(
      "gen_ai.chat",
      "gen_ai.chat",
      genAiAttributes(LLM_MODEL, LLM_BASE_URL),
      () =>
        chatSlot(
          LLM_BASE_URL,
          LLM_MODEL,
          LLM_API_KEY,
          0.9,
          [
            { role: "system", content: QUERY_SYSTEM_PROMPT },
            { role: "user", content: userBrief(candidate) },
          ],
          WRITER_TIMEOUT_MS,
        ),
    );

    const parsed = parseJsonObject(reply);
    if (parsed) {
      const existence =
        typeof parsed.existence === "string" ? parsed.existence.trim() : "";
      const demand =
        typeof parsed.demand === "string" ? parsed.demand.trim() : "";
      const incumbent =
        typeof parsed.incumbent === "string" ? parsed.incumbent.trim() : "";

      if (existence !== "" && demand !== "" && incumbent !== "") {
        return { existence, demand, incumbent };
      }
    }
  } catch {
    return templateQueries(candidate);
  }

  return templateQueries(candidate);
}

function templateQueries(
  candidate: Candidate,
): EvidencePack["queries"] {
  return {
    existence: `${candidate.name} ${candidate.oneLiner}`,
    demand: `${candidate.whoItsFor} ${candidate.workItRemoves} app OR tool`,
    incumbent: `best app for ${candidate.workItRemoves}`,
  };
}

const VERDICT_KINDS: VerdictKind[] = [
  "dead",
  "no_demand",
  "zombie_gap",
  "alive",
  "could_not_check",
];

function evidenceList(pack: EvidencePack): string {
  const lines: string[] = [];
  for (const key of ["existence", "demand", "incumbent"] as const) {
    lines.push(`${key.toUpperCase()}:`);
    for (const entry of pack.results[key]) {
      const titlePart = entry.title !== "" ? ` | title: ${entry.title}` : "";
      const snippetPart =
        entry.snippet !== "" ? ` | snippet: ${entry.snippet}` : "";
      lines.push(`- URL: ${entry.url}${titlePart}${snippetPart}`);
    }
  }
  return lines.join("\n");
}

export function buildJudgeMessages(
  candidate: Candidate,
  pack: EvidencePack,
): ChatMessage[] {
  return [
    { role: "system", content: JUDGE_SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(candidate, pack) },
  ];
}

export function buildUserPrompt(
  candidate: Candidate,
  pack: EvidencePack,
): string {
  return `${userBrief(candidate)}

SEARCH QUERIES RUN:
- existence: ${pack.queries.existence}
- demand: ${pack.queries.demand}
- incumbent: ${pack.queries.incumbent}

SEARCH RESULTS (every URL must be copied exactly into receiptUrls if used):
${evidenceList(pack)}

PAGE EXCERPTS:
${pack.excerpts.map((excerpt) => `SOURCE: ${excerpt.url}\n${excerpt.text}`).join("\n\n")}`;
}

export async function judgeCandidate(
  candidate: Candidate,
  pack: EvidencePack,
): Promise<CheckResult> {
  const messages = buildJudgeMessages(candidate, pack);

  const parsed = (await withSpan<Record<string, unknown>>(
    "gen_ai.chat",
    "gen_ai.chat",
    genAiAttributes(JUDGE_MODEL, JUDGE_BASE_URL),
    () =>
      askSlot(messages[0].content, messages[1].content, {
        baseUrl: JUDGE_BASE_URL,
        model: JUDGE_MODEL,
        apiKey: JUDGE_API_KEY,
        temperature: JUDGE_TEMPERATURE,
        timeoutMs: REQUEST_TIMEOUT_MS,
      }),
  )) as Record<string, unknown>;

  const verdict = parsed.verdict as VerdictKind;
  if (!VERDICT_KINDS.includes(verdict)) {
    throw new ModelOutputError("the judge did not return a valid verdict");
  }

  const headline = typeof parsed.headline === "string" ? parsed.headline.trim() : "";
  const killerName =
    typeof parsed.killerName === "string" && parsed.killerName.trim() !== ""
      ? parsed.killerName.trim()
      : null;
  const killerUrl =
    typeof parsed.killerUrl === "string" && parsed.killerUrl.trim() !== ""
      ? parsed.killerUrl.trim()
      : null;
  const receiptUrls = Array.isArray(parsed.receiptUrls)
    ? parsed.receiptUrls.filter(
        (url): url is string => typeof url === "string" && url.trim() !== "",
      )
    : [];

  return {
    verdict,
    headline: headline.slice(0, 140),
    killerName,
    killerUrl,
    receiptUrls,
  };
}
