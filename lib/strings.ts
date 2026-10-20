/**
 * Every user-facing string in Knell lives here.
 * Components import from this file — no copy is hard-coded in components.
 */

export type Mode = "hackathon" | "app";

export type TimeOption = {
  value: string;
  label: string;
};

export type Tombstone = {
  name: string;
  killer: string;
  cause: string;
  stamp: string;
};

export const strings = {
  meta: {
    title: "Knell — The bell that tolls for already-built ideas.",
    description:
      "Knell is the death bell for already-built ideas. Give it a hackathon theme, or give it yourself, and it will sweep the internet for what already exists — then hand back only what survives.",
  },

  nav: {
    wordmark: "Knell",
    run: "Run",
    home: "Home",
  },

  landing: {
    hero: {
      wordmark: "KNELL",
      line: "The bell that tolls for already-built ideas.",
      emphasis: "The bell that tolls",
      tail: "for already-built ideas.",
      cta: "Ring the bell",
    },
    modes: {
      claim: "Bring a theme. Or bring yourself.",
      body:
        "Give Knell a hackathon theme and it will find ideas worth that theme. Or give it yourself — what you can build, what you know, how much time you have — and it will find something for you to build. Either way it starts by naming possibilities instead of writing code.",
    },
    sweep: {
      claim: "We sweep the internet.",
      body:
        "Every candidate gets checked three ways: does this already exist, is anyone actually asking for it, and is the thing that already exists any good. Each answer comes with a link you can open.",
    },
    verdict: {
      claim: "The bell tolls, or it doesn't.",
      body:
        "Ideas that are already built are named dead, with the receipt that killed them. Ideas that survive come back ranked, with the evidence that kept them alive.",
    },
    graveyard: {
      claim: "The graveyard so far.",
      tally: "Knell killed 9 of its own names before it had one.",
      killedBy: "Killed by {killer}",
      tombstones: [
        {
          name: "Verdikt",
          killer: "a validator of the same name",
          cause: "The name was taken by the competition.",
          stamp: "Dead",
        },
        {
          name: "Unbuilt",
          killer: "unbuilt.me",
          cause: "Don't build what already exists. Including this name.",
          stamp: "Dead",
        },
        {
          name: "Premortem",
          killer: "being a method, not a name",
          cause: "A technique, not a brand.",
          stamp: "Dead",
        },
        {
          name: "FlipKit",
          killer: "SnapSell",
          cause: "Photo to listing to posted. Already done, in under 30 seconds.",
          stamp: "Dead",
        },
        {
          name: "ApplyOnce",
          killer: "a Chrome extension of the same name",
          cause: "The name and the idea were both taken.",
          stamp: "Dead",
        },
      ] satisfies readonly Tombstone[],
    },
  },

  run: {
    title: "Ring it.",
    subtitle:
      "Knell starts by naming ideas. Nothing here is checked yet — the sweep comes after.",
    modes: {
      hackathon: "Hackathon",
      app: "Build an app",
    },
    switchHint: "Switch mode. Your answers are kept on both sides.",
    hackathon: {
      theme: {
        label: "Theme",
        placeholder: "e.g. climate tools for city cyclists",
        required: true,
      },
      about: {
        label: "About you — skills and context",
        placeholder: "e.g. backend engineer, bike mechanic, rides daily",
        required: false,
      },
      time: {
        label: "Time you have",
        required: false,
        options: [
          { value: "a weekend", label: "A weekend" },
          { value: "one week", label: "One week" },
          { value: "two+ weeks", label: "Two+ weeks" },
        ] satisfies readonly TimeOption[],
      },
    },
    app: {
      stack: {
        label: "Your stack",
        placeholder: "e.g. TypeScript, React, Postgres, a Raspberry Pi",
        required: false,
      },
      knows: {
        label: "Things you know or care about",
        placeholder: "e.g. I run a climbing gym and hate paper sign-up sheets",
        required: false,
      },
      time: {
        label: "Time you have",
        required: false,
        options: [
          { value: "a weekend", label: "A weekend" },
          { value: "a few weeks", label: "A few weeks" },
          { value: "ongoing side project", label: "Ongoing side project" },
        ] satisfies readonly TimeOption[],
      },
      goal: {
        label: "What you want from it",
        required: false,
        options: [
          { value: "make money", label: "Make money" },
          { value: "get users", label: "Get users" },
          { value: "learn and portfolio", label: "Learn and portfolio" },
          { value: "just fun", label: "Just fun" },
        ] satisfies readonly TimeOption[],
      },
      platform: {
        label: "Platform",
        required: false,
        options: [
          { value: "web", label: "Web" },
          { value: "mobile", label: "Mobile" },
          { value: "either", label: "Either" },
        ] satisfies readonly TimeOption[],
      },
    },
    submit: "Generate candidates",
    submitting: "Naming candidates…",
    notChosen: "Not specified",
    emptyError:
      "Fill in your stack, or what you know — at least one of the two. Knell needs a foothold.",
    themeRequiredError:
      "Give it a theme first. That is the one thing it cannot start without.",
    resultsNote: "These are unchecked. The internet sweep is where they die.",
    resultsTitle: "Candidates",
    noCandidates: "No candidates came back. Nothing to show — try again.",
    cards: {
      whoItsFor: "Who it’s for",
      workItRemoves: "The work it removes",
      buildShape: "Build shape",
    },
  },

  errors: {
    modelUnreachable:
      "Model not reachable — start Ollama and pull the model, or set LLM_BASE_URL / LLM_API_KEY",
    invalidCandidates:
      "The model did not return usable candidates. Nothing was invented — try again.",
    invalidIntake: "That intake was not understood. Fill the form again.",
    generic: "Something went wrong. Nothing was invented — try again.",
    title: "Not a candidate list.",
  },

  badges: {
    unchecked: "Unchecked",
  },
} as const;
