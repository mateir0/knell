"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/Field";
import { CandidateCard } from "@/components/run/CandidateCard";
import { MagneticButton } from "@/components/lightswind/magnetic-button";
import { strings } from "@/lib/strings";
import type { Candidate } from "@/lib/schema";
import type { CheckResult, VerdictKind } from "@/lib/verdict";

type Mode = "hackathon" | "app";

type RunState = {
  candidates: Candidate[] | null;
  error: string | null;
  loading: boolean;
};

type SweepState = {
  status: "idle" | "checking" | "done";
  result: CheckResult | null;
};

const emptyRun: RunState = { candidates: null, error: null, loading: false };

const survivorOrder: Record<VerdictKind, number> = {
  alive: 0,
  zombie_gap: 1,
  no_demand: 2,
  dead: 3,
  could_not_check: 4,
};

export function RunPanel() {
  const [mode, setMode] = useState<Mode>("hackathon");

  const [theme, setTheme] = useState("");
  const [about, setAbout] = useState("");
  const [hackathonTime, setHackathonTime] = useState("");

  const [stack, setStack] = useState("");
  const [knows, setKnows] = useState("");
  const [appTime, setAppTime] = useState("");
  const [goal, setGoal] = useState("");
  const [platform, setPlatform] = useState("");

  const [hackathonRun, setHackathonRun] = useState<RunState>(emptyRun);
  const [appRun, setAppRun] = useState<RunState>(emptyRun);

  const [sweep, setSweep] = useState<Record<string, SweepState>>({});
  const [sweeping, setSweeping] = useState(false);
  const [checkedCount, setCheckedCount] = useState(0);

  const run = mode === "hackathon" ? hackathonRun : appRun;
  const setRun = mode === "hackathon" ? setHackathonRun : setAppRun;

  async function checkOne(candidate: Candidate): Promise<CheckResult> {
    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate }),
      });
      const data: unknown = await response.json().catch(() => null);
      if (
        data &&
        typeof data === "object" &&
        "verdict" in data &&
        typeof (data as { verdict?: unknown }).verdict === "string"
      ) {
        return data as CheckResult;
      }
    } catch {
      return {
        verdict: "could_not_check",
        headline: strings.errors.generic,
        killerName: null,
        killerUrl: null,
        receiptUrls: [],
      };
    }
    return {
      verdict: "could_not_check",
      headline: strings.errors.generic,
      killerName: null,
      killerUrl: null,
      receiptUrls: [],
    };
  }

  async function runSweep() {
    if (sweeping || !run.candidates || run.candidates.length === 0) return;
    setSweeping(true);
    setCheckedCount(0);
    for (const candidate of run.candidates) {
      setSweep((prev) => ({
        ...prev,
        [candidate.name]: { status: "checking", result: null },
      }));
      const result = await checkOne(candidate);
      setSweep((prev) => ({
        ...prev,
        [candidate.name]: { status: "done", result },
      }));
      setCheckedCount((prev) => prev + 1);
    }
    setSweeping(false);
  }

  async function retryCheck(candidate: Candidate) {
    if (sweeping) return;
    setSweeping(true);
    setSweep((prev) => ({
      ...prev,
      [candidate.name]: { status: "checking", result: null },
    }));
    const result = await checkOne(candidate);
    setSweep((prev) => ({
      ...prev,
      [candidate.name]: { status: "done", result },
    }));
    setSweeping(false);
  }

  async function request(payload: unknown) {
    setSweep({});
    setCheckedCount(0);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: unknown = await response.json().catch(() => null);
      const errorMessage =
        data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error
          : null;

      if (!response.ok) {
        setRun({
          candidates: null,
          error: errorMessage ?? strings.errors.generic,
          loading: false,
        });
        return;
      }

      const list =
        data && typeof data === "object" && "candidates" in data && Array.isArray(data.candidates)
          ? (data.candidates as Candidate[])
          : [];

      setRun({
        candidates: list,
        error: list.length === 0 ? strings.run.noCandidates : null,
        loading: false,
      });
    } catch {
      setRun({ candidates: null, error: strings.errors.generic, loading: false });
    }
  }

  function clearNeedInput() {
    setRun((prev) =>
      prev.error === strings.run.needInput ? { ...prev, error: null } : prev,
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRun({ candidates: null, error: null, loading: true });

    if (mode === "hackathon") {
      const trimmedTheme = theme.trim();
      const trimmedAbout = about.trim();
      if (!trimmedTheme && !trimmedAbout) {
        setRun({ candidates: null, error: strings.run.needInput, loading: false });
        return;
      }
      if (!trimmedTheme) {
        setRun({
          candidates: null,
          error: strings.run.themeRequiredError,
          loading: false,
        });
        return;
      }

      await request({
        mode: "hackathon",
        theme: trimmedTheme,
        about: about.trim(),
        ...(hackathonTime ? { time: hackathonTime } : {}),
      });
      return;
    }

    const trimmedStack = stack.trim();
    const trimmedKnows = knows.trim();
    if (!trimmedStack && !trimmedKnows) {
      setRun({ candidates: null, error: strings.run.emptyError, loading: false });
      return;
    }

    await request({
      mode: "app",
      stack: trimmedStack,
      knows: trimmedKnows,
      ...(appTime ? { time: appTime } : {}),
      ...(goal ? { goal } : {}),
      ...(platform ? { platform } : {}),
    });
  }

  const candidates = useMemo(() => run.candidates ?? [], [run.candidates]);
  const allChecked =
    candidates.length > 0 &&
    candidates.every(
      (candidate) => sweep[candidate.name]?.status === "done",
    );
  const sweepFinished = allChecked && !sweeping;

  const displayCandidates = useMemo(() => {
    if (!sweepFinished) return candidates;
    return [...candidates].sort((a, b) => {
      const verdictA = sweep[a.name]?.result?.verdict ?? null;
      const verdictB = sweep[b.name]?.result?.verdict ?? null;
      const rankA = verdictA ? survivorOrder[verdictA] : survivorOrder.could_not_check + 1;
      const rankB = verdictB ? survivorOrder[verdictB] : survivorOrder.could_not_check + 1;
      return rankA - rankB;
    });
  }, [sweepFinished, candidates, sweep]);

  const survivorCount = useMemo(
    () =>
      candidates.filter((candidate) => {
        const verdict = sweep[candidate.name]?.result?.verdict;
        return verdict === "alive" || verdict === "zombie_gap";
      }).length,
    [candidates, sweep],
  );

  return (
    <div>
      <nav className="flex items-center justify-between gap-md border-b border-faint py-lg">
        <div className="flex items-center md:w-[150px]">
          <MagneticButton
            href="/"
            variant="ghost"
            size="md"
            strength={0.35}
            radius={80}
            className="whitespace-nowrap border-accent/40 bg-surface/60 px-5 text-button uppercase text-ink backdrop-blur-sm hover:border-accent hover:text-accent"
          >
            {strings.nav.home}
          </MagneticButton>
        </div>

        <div className="flex flex-1 justify-center">
          <div
            className="inline-flex flex-1 items-center gap-1 rounded-full border border-border bg-surface/80 p-1 backdrop-blur-sm"
            role="group"
            aria-label={strings.run.modes.hackathon}
          >
            {(["hackathon", "app"] as const).map((option) => {
              const active = mode === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMode(option)}
                  aria-pressed={active}
                  className={`rounded-full border border-transparent px-3 py-2 text-[11px] tracking-wide font-bold whitespace-nowrap uppercase transition-colors duration-150 sm:text-button sm:px-5 ${
                    active ? "bg-accent/10 text-accent border-accent/60" : "text-body hover:text-ink"
                  }`}
                >
                  {option === "hackathon" ? strings.run.modes.hackathon : strings.run.modes.app}
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden items-center justify-end md:flex md:w-[150px]">
          <span className="text-caption-sm uppercase text-muted">{strings.nav.run}</span>
        </div>
      </nav>

      <p className="mt-md text-center text-body-xs text-muted">
        {strings.run.switchHint}
      </p>

      <div className="mt-xl grid gap-xl items-start lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <div
            aria-hidden="true"
            className="mb-md h-[2px] w-16 bg-accent"
          />
          <h1 className="knell-display-lg text-display-lg uppercase text-ink">
            {strings.run.title}
          </h1>
          <p className="mt-sm max-w-[54ch] text-body-md text-body">
            {strings.run.subtitle}
          </p>

      {mode === "hackathon" ? (
        <form onSubmit={handleSubmit} className="mt-lg">
          <div className="space-y-md">
            <div className="space-y-xs">
              <FieldLabel htmlFor="theme">
                {strings.run.hackathon.theme.label}
              </FieldLabel>
              <Textarea
                id="theme"
                name="theme"
                value={theme}
                placeholder={strings.run.hackathon.theme.placeholder}
                onChange={(event) => {
                  setTheme(event.target.value);
                  clearNeedInput();
                }}
              />
            </div>

            <div className="space-y-xs">
              <FieldLabel htmlFor="about">
                {strings.run.hackathon.about.label}
              </FieldLabel>
              <Textarea
                id="about"
                name="about"
                value={about}
                placeholder={strings.run.hackathon.about.placeholder}
                onChange={(event) => {
                  setAbout(event.target.value);
                  clearNeedInput();
                }}
              />
            </div>

            <div className="space-y-xs sm:max-w-[320px]">
              <FieldLabel htmlFor="hackathon-time">
                {strings.run.hackathon.time.label}
              </FieldLabel>
              <Select
                id="hackathon-time"
                name="time"
                value={hackathonTime}
                onChange={(event) => setHackathonTime(event.target.value)}
              >
                <option value="">{strings.run.notChosen}</option>
                {strings.run.hackathon.time.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="mt-lg">
            <Button type="submit" disabled={run.loading} className="w-full">
              {run.loading ? strings.run.submitting : strings.run.submit}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="mt-lg">
          <div className="space-y-md">
            <div className="space-y-xs">
              <FieldLabel htmlFor="stack">{strings.run.app.stack.label}</FieldLabel>
              <Input
                id="stack"
                name="stack"
                value={stack}
                placeholder={strings.run.app.stack.placeholder}
                onChange={(event) => setStack(event.target.value)}
              />
            </div>

            <div className="space-y-xs">
              <FieldLabel htmlFor="knows">{strings.run.app.knows.label}</FieldLabel>
              <Textarea
                id="knows"
                name="knows"
                value={knows}
                placeholder={strings.run.app.knows.placeholder}
                onChange={(event) => setKnows(event.target.value)}
              />
            </div>

            <div className="grid gap-md sm:grid-cols-3">
              <div className="space-y-xs">
                <FieldLabel htmlFor="app-time">{strings.run.app.time.label}</FieldLabel>
                <Select
                  id="app-time"
                  name="time"
                  value={appTime}
                  onChange={(event) => setAppTime(event.target.value)}
                >
                  <option value="">{strings.run.notChosen}</option>
                  {strings.run.app.time.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-xs">
                <FieldLabel htmlFor="goal">{strings.run.app.goal.label}</FieldLabel>
                <Select
                  id="goal"
                  name="goal"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                >
                  <option value="">{strings.run.notChosen}</option>
                  {strings.run.app.goal.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-xs">
                <FieldLabel htmlFor="platform">{strings.run.app.platform.label}</FieldLabel>
                <Select
                  id="platform"
                  name="platform"
                  value={platform}
                  onChange={(event) => setPlatform(event.target.value)}
                >
                  <option value="">{strings.run.notChosen}</option>
                  {strings.run.app.platform.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-lg">
            <Button type="submit" disabled={run.loading} className="w-full">
              {run.loading ? strings.run.submitting : strings.run.submit}
            </Button>
          </div>
        </form>
      )}

      {run.error ? (
        <p className="mt-lg rounded-xs border border-accent bg-surface/80 p-md text-body-md text-ink backdrop-blur-sm">
          {run.error}
        </p>
      ) : null}

      {candidates.length > 0 ? (
        <section className="mt-section">
          <p className="text-body-md text-body">{strings.run.resultsNote}</p>
          <h2 className="mt-sm text-caption-sm uppercase text-accent">
            {sweepFinished && survivorCount > 0
              ? strings.run.sweep.survivorsTitle
              : strings.run.resultsTitle}
          </h2>
          <div className="mt-md flex flex-wrap items-center gap-md">
            <Button onClick={runSweep} disabled={sweeping}>
              {strings.run.sweep.start}
            </Button>
            {sweeping ? (
              <p className="text-body-xs text-muted">
                {strings.run.sweep.progressPrefix} {checkedCount}{" "}
                {strings.run.sweep.progressOf} {candidates.length}
              </p>
            ) : null}
          </div>
          <div className="mt-md grid gap-md sm:grid-cols-2">
            {displayCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.name}
                candidate={candidate}
                status={sweep[candidate.name]?.status ?? "idle"}
                result={sweep[candidate.name]?.result ?? null}
                onRetry={() => retryCheck(candidate)}
                sweepRunning={sweeping}
              />
            ))}
          </div>
          {sweepFinished && survivorCount === 0 ? (
            <p className="mt-md text-body-md text-body">
              {strings.run.sweep.noneSurvived}
            </p>
          ) : null}
        </section>
      ) : null}
        </div>

        <aside className="hidden sticky top-lg lg:block">
          <div className="border border-faint bg-surface/80 p-lg backdrop-blur-sm">
            <h2 className="text-heading text-ink">
              {strings.landing.sweep.claim}
            </h2>
            <p className="mt-sm text-body-sm text-body">
              {strings.landing.sweep.body}
            </p>
            <div>
              {strings.landing.sweep.checks.map((check, index) => (
                <div
                  key={check.index}
                  className={`flex gap-md py-md ${
                    index > 0 ? "border-t border-faint" : ""
                  }`}
                >
                  <span className="pt-0.5 text-caption-sm text-accent">
                    {check.index}
                  </span>
                  <div>
                    <p className="text-body-md font-medium text-ink">
                      {check.title}
                    </p>
                    <p className="text-body-sm text-body">{check.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="border-t border-faint pt-md text-body-xs text-muted">
              {strings.run.resultsNote}
            </p>
          </div>
        </aside>
      </div>

      <footer className="flex items-center justify-between border-t border-faint py-lg">
        <span className="text-caption-sm uppercase text-muted">
          {strings.nav.wordmark}
        </span>
        <span className="hidden text-caption-sm uppercase text-muted sm:block">
          {strings.landing.hero.tagline}
        </span>
      </footer>
    </div>
  );
}
