"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/Field";
import { CandidateCard } from "@/components/run/CandidateCard";
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
      <div>
        <div
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1"
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
                className={`rounded-full border border-transparent px-5 py-2 text-button uppercase transition-colors duration-150 ${
                  active ? "bg-accent/10 text-accent border-accent/60" : "text-body hover:text-ink"
                }`}
              >
                {option === "hackathon" ? strings.run.modes.hackathon : strings.run.modes.app}
              </button>
            );
          })}
        </div>
        <span className="mt-xs block text-body-xs text-muted">
          {strings.run.switchHint}
        </span>
      </div>

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
                rows={3}
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
                rows={3}
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
                rows={3}
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
        <p className="mt-lg rounded-xs border border-accent bg-surface p-md text-body-md text-ink">
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
  );
}
