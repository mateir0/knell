# Knell

**Knell is the death bell for already-built ideas.**

You give it either a hackathon theme, or yourself — a developer who can build
but has no idea what to build. Knell names candidate ideas, then sweeps the
internet for each one: does it already exist, is anyone asking for it, and is
the existing version any good. Ideas that are already built get killed, with
the receipt that killed them. Survivors come back ranked, with evidence.

## The two modes

| Mode | You give it | It gives you |
| --- | --- | --- |
| **Hackathon** | A theme (and optionally your skills, context and time) | 8 candidate ideas that fit the theme |
| **Build an app** | Your stack, what you know or care about, time, goal, platform | 8 candidate ideas that sit where your stack meets your worlds |

## Setup

Requires Node 20+ and npm.

```bash
npm install
cp .env.example .env.local   # optional: only if you want to change the model
npm run dev
```

Then open http://localhost:3000.

### Model

Knell needs an OpenAI-compatible chat completions endpoint. Two ways to get one:

**Local Ollama (default, no key):**

```bash
ollama pull gemma3:4b
```

Leave `LLM_API_KEY` empty. The defaults already point at
`http://localhost:11434/v1` with model `gemma3:4b`.

**Hosted open-weight endpoint:** point `LLM_BASE_URL` at it and set
`LLM_API_KEY` to its key. Any endpoint that speaks
`POST {LLM_BASE_URL}/chat/completions` works.

If the model cannot be reached, Knell says so plainly and invents nothing.

## Environment variables

| Variable | Default | Notes |
| --- | --- | --- |
| `LLM_BASE_URL` | `http://localhost:11434/v1` | Base URL of the OpenAI-compatible endpoint |
| `LLM_MODEL` | `gemma3:4b` | Model tag sent to the endpoint |
| `LLM_API_KEY` | _(empty)_ | Optional; empty for local Ollama, set for hosted endpoints |

See `.env.example`. No secrets are committed; `.env.local` is gitignored.

## Scripts

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run start      # run the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Design system

[`design.md`](./design.md) is the design system and the single source of truth
for every visual decision — colours, type scale, spacing, radii, components,
states and motion. It is not modified by the app; the tokens live in
`app/globals.css` and every component consumes them by name.

## Engine room

The two routes are thin shells over Mastra workflows (`lib/workflows.ts`):

- `knell-generate` — one `generate` step around the candidate model. Failures
  are marshaled through step outputs as typed data and re-thrown by the runner,
  so the HTTP responses are exactly the same as before.
- `knell-check` — `write-queries` → `build-evidence` → `judge` → `validate`.
  Search and model failures travel as data between steps too; the runner
  restores the error classes (and messages) before the route maps them. The
  graveyard cache is still checked before the workflow starts.

Sentry tracing is DSN-gated and off until you set `SENTRY_DSN` /
`NEXT_PUBLIC_SENTRY_DSN`. Spans: `knell.generate` and `knell.check` (root
routes), `gen_ai.chat` (each model call, with the model slot as an attribute),
`knell.search` (with the serving search provider), `knell.fetch` (page
excerpts) and `knell.graveyard` (cache hits and burials). Typed failures that
change an outcome are captured as exceptions.

The graveyard doubles as a training set. `scripts/export-judge-dataset.ts`
dumps every real verdict as chat-format JSONL, `scripts/tinker/train_judge.py`
fine-tunes a LoRA adapter on Tinker, and `scripts/tinker/eval_judge.py` scores
it against the base model on a held-out split. The tuned judge replaces the
production one only if it beats the base on both verdict agreement and
receipt validity — the full loop is in `scripts/README-tinker.md`.

## Built so far / Coming next

**Done (Prompt 1)**

- Next.js 15 (App Router) + TypeScript (strict) + Tailwind CSS v4 scaffold
- The full design-token system wired into Tailwind v4, with Archivo as the only font
- The landing page: five screens, GSAP + ScrollTrigger motion on the hero, graveyard of real kills
- `/run`: two-mode intake (Hackathon / Build an app) with per-mode state and validation
- `POST /api/generate`: eight candidates from an OpenAI-compatible model, zod-validated, retried once, and never faked

**Next**

- The internet sweep: live-checking every candidate against the internet
- Verdicts with receipts — dead ideas named, linked, and stamped
- The running graveyard, persisted between runs

---

Hacktoberfest 2026, Week 3 — "Slow and Steady": open-source AI that rewards
laziness.
