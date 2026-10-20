"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/Field";
import { CandidateCard } from "@/components/run/CandidateCard";
import { MagneticButton } from "@/components/lightswind/magnetic-button";
import { strings } from "@/lib/strings";
import type { Candidate } from "@/lib/schema";

type Mode = "hackathon" | "app";

type RunState = {
  candidates: Candidate[] | null;
  error: string | null;
  loading: boolean;
};

const emptyRun: RunState = { candidates: null, error: null, loading: false };

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

  const run = mode === "hackathon" ? hackathonRun : appRun;
  const setRun = mode === "hackathon" ? setHackathonRun : setAppRun;

  async function request(payload: unknown) {
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRun({ candidates: null, error: null, loading: true });

    if (mode === "hackathon") {
      const trimmedTheme = theme.trim();
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
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface/80 p-1 backdrop-blur-sm"
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
                  className={`rounded-full border border-transparent px-3 py-2 text-button uppercase transition-colors duration-150 sm:px-5 ${
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
                required
                value={theme}
                placeholder={strings.run.hackathon.theme.placeholder}
                onChange={(event) => setTheme(event.target.value)}
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
                onChange={(event) => setAbout(event.target.value)}
              />
            </div>

            <div className="space-y-xs sm:max-w-xs">
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

      {run.candidates && run.candidates.length > 0 ? (
        <section className="mt-section">
          <p className="text-body-md text-body">{strings.run.resultsNote}</p>
          <h2 className="mt-sm text-caption-sm uppercase text-accent">
            {strings.run.resultsTitle}
          </h2>
          <div className="mt-md grid gap-md sm:grid-cols-2">
            {run.candidates.map((candidate) => (
              <CandidateCard key={candidate.name} candidate={candidate} />
            ))}
          </div>
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
