import {
  candidateListSchema,
  type AppIntake,
  type Candidate,
  type HackathonIntake,
  type Intake,
} from "./schema";
import { genAiAttributes, withSpan } from "./trace";

export const LLM_BASE_URL =
  process.env.LLM_BASE_URL ?? "http://localhost:11434/v1";
export const LLM_MODEL = process.env.LLM_MODEL ?? "gemma3:4b";
export const LLM_API_KEY = process.env.LLM_API_KEY ?? "";

const REQUEST_TIMEOUT_MS = 90_000;
const REACHABILITY_TIMEOUT_MS = 6_000;

export class ModelUnreachableError extends Error {}
export class ModelOutputError extends Error {}

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

const SYSTEM_PROMPT = `You are Knell, a product scout that only proposes things worth building.
You answer with candidate app ideas as a JSON array and nothing else.

Output contract — breaking any of these makes the answer unusable:
- Reply with a single JSON array and NOTHING else. No prose, no preamble, no explanation, no markdown, no code fences.
- The array contains exactly 8 objects.
- Every object has exactly these five keys: "name", "oneLiner", "whoItsFor", "workItRemoves", "buildShape".
- "name": a short, brandable, pronounceable product name of one to three words. Not a category word, not a generic description.
- "oneLiner": one sentence, at most 20 words, saying what it is.
- "whoItsFor": one sentence naming a specific person and the situation they are in.
- "workItRemoves": one sentence naming the exact chore, paperwork, waiting or mental effort it takes away from that person.
- "buildShape": one sentence describing the rough shape of a v1 that could exist in a weekend or two.

Quality rules:
- Real variety: the 8 ideas must serve different people, use different mechanics and cover different categories. Eight variations of one idea is a failure.
- Every idea must remove a real, named chore for a specific person. If you cannot name the chore, do not include the idea.
- No idea may require more than a weekend or two of v1 work.`;

const STRICT_SUFFIX = `

STRICT OUTPUT CHECK — your previous reply could not be parsed:
- Reply with the raw JSON array only. The first character of your reply must be "[" and the last must be "]".
- No markdown fences, no commentary, no trailing text.
- Exactly 8 objects, each with exactly the five keys: "name", "oneLiner", "whoItsFor", "workItRemoves", "buildShape".`;

function notSpecified(value: string | undefined): string {
  return value && value.trim() ? value.trim() : "not specified";
}

function buildUserPrompt(intake: Intake): string {
  if (intake.mode === "hackathon") {
    return hackathonPrompt(intake);
  }
  return appPrompt(intake);
}

function hackathonPrompt(intake: HackathonIntake): string {
  return `HACKATHON THEME:
${intake.theme.trim()}

ABOUT THE BUILDER (skills and context):
${notSpecified(intake.about)}

TIME AVAILABLE:
${notSpecified(intake.time)}

Generate 8 candidate ideas that fit this hackathon theme. Each one must fit the theme on its face, remove a real named chore for a specific person, and be buildable as a small v1. Keep the 8 genuinely different from each other in user, mechanic and category.`;
}

function appPrompt(intake: AppIntake): string {
  return `THE DEVELOPER'S STACK:
${notSpecified(intake.stack)}

THE WORLDS THEY KNOW OR CARE ABOUT:
${notSpecified(intake.knows)}

TIME AVAILABLE:
${notSpecified(intake.time)}

WHAT THEY WANT FROM IT:
${notSpecified(intake.goal)}

PLATFORM:
${notSpecified(intake.platform)}

Generate 8 candidate ideas that sit at the crossing of this developer's stack, the worlds they know or care about, and the goal they stated. Each one must remove a real named chore for a specific person, be buildable in the time they have, and be genuinely different from the other 7 in user, mechanic and category.`;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const apiKey = LLM_API_KEY.trim();
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  return headers;
}

/**
 * Fails fast when the endpoint cannot be reached at all (connection refused,
 * DNS failure, no answer). Any HTTP answer — including 401 or 404 — means the
 * endpoint is there, so the real request is allowed to report the real problem.
 */
async function assertReachable(): Promise<void> {
  const base = LLM_BASE_URL.replace(/\/+$/, "");
  try {
    await fetch(`${base}/models`, {
      headers: authHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(REACHABILITY_TIMEOUT_MS),
    });
  } catch (error) {
    throw new ModelUnreachableError(
      `could not reach ${base}: ${error instanceof Error ? error.message : "connection failed"}`,
    );
  }
}

async function chatCore(messages: ChatMessage[]): Promise<string> {
  const endpoint = `${LLM_BASE_URL.replace(/\/+$/, "")}/chat/completions`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...authHeaders(),
  };

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: LLM_MODEL,
        messages,
        temperature: 0.9,
        stream: false,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
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

async function chat(messages: ChatMessage[]): Promise<string> {
  return withSpan(
    "gen_ai.chat",
    "gen_ai.chat",
    genAiAttributes(LLM_MODEL, LLM_BASE_URL),
    () => chatCore(messages),
  ) as Promise<string>;
}

function extractJsonArray(raw: string): string | null {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced?.[1] ?? trimmed;
  const start = body.indexOf("[");
  const end = body.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return null;
  return body.slice(start, end + 1);
}

function parseCandidates(raw: string): Candidate[] | null {
  const json = extractJsonArray(raw);
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as unknown;
    const result = candidateListSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function generateCandidates(intake: Intake): Promise<Candidate[]> {
  await assertReachable();

  const userPrompt = buildUserPrompt(intake);

  const first = await chat([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ]);

  const candidates = parseCandidates(first);
  if (candidates) return candidates;

  const second = await chat([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `${userPrompt}${STRICT_SUFFIX}` },
  ]);

  const retried = parseCandidates(second);
  if (retried) return retried;

  throw new ModelOutputError("model did not return a valid candidate array");
}
