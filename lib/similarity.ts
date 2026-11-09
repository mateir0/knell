/**
 * Title similarity helpers used to spot ideas that were already built.
 * Kept dependency-free so it can run in any runtime.
 */

/**
 * Lowercase, trim, strip punctuation, and collapse runs of spaces into one.
 * Example: "  Hello,  World! " -> "hello world"
 */
export function normalizeTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function words(s: string): string[] {
  const normalized = normalizeTitle(s);
  if (normalized === "") return [];
  return normalized.split(" ");
}

/**
 * Jaccard similarity of the word sets of two normalized titles, rounded to
 * three decimal places. Both titles empty -> 1, exactly one empty -> 0.
 */
export function titleSimilarity(a: string, b: string): number {
  const left = new Set(words(a));
  const right = new Set(words(b));

  if (left.size === 0 && right.size === 0) return 1;
  if (left.size === 0 || right.size === 0) return 0;

  let shared = 0;
  for (const word of left) {
    if (right.has(word)) shared += 1;
  }

  const union = left.size + right.size - shared;
  return Math.round((shared / union) * 1000) / 1000;
}

export type RankedMatch = {
  title: string;
  score: number;
};

/**
 * Keep candidates at or above `threshold`, best score first, ties broken
 * alphabetically by normalized title. Original candidate strings are returned.
 */
export function rankMatches(
  query: string,
  candidates: string[],
  threshold = 0.5,
): RankedMatch[] {
  const matches: (RankedMatch & { key: string })[] = [];

  for (const candidate of candidates) {
    const score = titleSimilarity(query, candidate);
    if (score < threshold) continue;
    matches.push({ title: candidate, score, key: normalizeTitle(candidate) });
  }

  matches.sort((x, y) => {
    if (y.score !== x.score) return y.score - x.score;
    if (x.key < y.key) return -1;
    if (x.key > y.key) return 1;
    return 0;
  });

  return matches.map(({ title, score }) => ({ title, score }));
}
