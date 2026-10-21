import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import {
  buildEvidence,
  SearchBudgetExhaustedError,
  SearchNotConfiguredError,
} from "./evidence";
import { judgeCandidate, writeQueries } from "./judge";
import {
  generateCandidates,
  ModelOutputError,
  ModelUnreachableError,
} from "./llm";
import { candidateSchema, intakeSchema, type Candidate, type Intake } from "./schema";
import { validateVerdict } from "./validate";
import {
  checkResultSchema,
  evidencePackSchema,
  type CheckResult,
  type EvidencePack,
} from "./verdict";

const queriesSchema = z.object({
  existence: z.string(),
  demand: z.string(),
  incumbent: z.string(),
});

const searchFailureSchema = z.object({
  kind: z.enum(["not_configured", "budget_exhausted"]),
  detail: z.string(),
});

const judgeFailureSchema = z.object({
  kind: z.enum(["unreachable", "output"]),
  detail: z.string(),
});

const modelFailureSchema = z.object({
  kind: z.enum(["unreachable", "output"]),
  detail: z.string(),
});

const checkInputSchema = z.object({ candidate: candidateSchema });

const checkOutputSchema = z.object({
  candidate: candidateSchema,
  pack: evidencePackSchema.optional(),
  served: checkResultSchema.optional(),
  searchFailure: searchFailureSchema.optional(),
  judgeFailure: judgeFailureSchema.optional(),
});

const writeQueriesStep = createStep({
  id: "write-queries",
  inputSchema: checkInputSchema,
  outputSchema: z.object({
    candidate: candidateSchema,
    queries: queriesSchema,
  }),
  execute: async ({ inputData }) => {
    const queries = await writeQueries(inputData.candidate);
    return { candidate: inputData.candidate, queries };
  },
});

const buildEvidenceStep = createStep({
  id: "build-evidence",
  inputSchema: z.object({
    candidate: candidateSchema,
    queries: queriesSchema,
  }),
  outputSchema: z.object({
    candidate: candidateSchema,
    pack: evidencePackSchema.optional(),
    searchFailure: searchFailureSchema.optional(),
  }),
  execute: async ({ inputData }) => {
    try {
      const pack = await buildEvidence(inputData.candidate, inputData.queries);
      return { candidate: inputData.candidate, pack };
    } catch (error) {
      if (error instanceof SearchNotConfiguredError) {
        return {
          candidate: inputData.candidate,
          searchFailure: { kind: "not_configured" as const, detail: error.message },
        };
      }
      if (error instanceof SearchBudgetExhaustedError) {
        return {
          candidate: inputData.candidate,
          searchFailure: { kind: "budget_exhausted" as const, detail: error.message },
        };
      }
      throw error;
    }
  },
});

const judgeStep = createStep({
  id: "judge",
  inputSchema: z.object({
    candidate: candidateSchema,
    pack: evidencePackSchema.optional(),
    searchFailure: searchFailureSchema.optional(),
  }),
  outputSchema: z.object({
    candidate: candidateSchema,
    pack: evidencePackSchema.optional(),
    verdict: checkResultSchema.optional(),
    searchFailure: searchFailureSchema.optional(),
    judgeFailure: judgeFailureSchema.optional(),
  }),
  execute: async ({ inputData }) => {
    if (inputData.searchFailure !== undefined || inputData.pack === undefined) {
      return {
        candidate: inputData.candidate,
        pack: inputData.pack,
        searchFailure: inputData.searchFailure,
      };
    }

    try {
      const verdict = await judgeCandidate(inputData.candidate, inputData.pack);
      return { candidate: inputData.candidate, pack: inputData.pack, verdict };
    } catch (error) {
      if (error instanceof ModelUnreachableError) {
        return {
          candidate: inputData.candidate,
          pack: inputData.pack,
          judgeFailure: { kind: "unreachable" as const, detail: error.message },
        };
      }
      if (error instanceof ModelOutputError) {
        return {
          candidate: inputData.candidate,
          pack: inputData.pack,
          judgeFailure: { kind: "output" as const, detail: error.message },
        };
      }
      throw error;
    }
  },
});

const validateStep = createStep({
  id: "validate",
  inputSchema: z.object({
    candidate: candidateSchema,
    pack: evidencePackSchema.optional(),
    verdict: checkResultSchema.optional(),
    searchFailure: searchFailureSchema.optional(),
    judgeFailure: judgeFailureSchema.optional(),
  }),
  outputSchema: checkOutputSchema,
  execute: async ({ inputData }) => {
    if (
      inputData.searchFailure !== undefined ||
      inputData.judgeFailure !== undefined ||
      inputData.pack === undefined ||
      inputData.verdict === undefined
    ) {
      return {
        candidate: inputData.candidate,
        pack: inputData.pack,
        searchFailure: inputData.searchFailure,
        judgeFailure: inputData.judgeFailure,
      };
    }

    const served = validateVerdict(inputData.verdict, inputData.pack);
    return { candidate: inputData.candidate, pack: inputData.pack, served };
  },
});

const checkWorkflow = createWorkflow({
  id: "knell-check",
  inputSchema: checkInputSchema,
  outputSchema: checkOutputSchema,
})
  .then(writeQueriesStep)
  .then(buildEvidenceStep)
  .then(judgeStep)
  .then(validateStep)
  .commit();

const generateStep = createStep({
  id: "generate",
  inputSchema: z.object({ intake: intakeSchema }),
  outputSchema: z.object({
    candidates: z.array(candidateSchema).optional(),
    modelFailure: modelFailureSchema.optional(),
  }),
  execute: async ({ inputData }) => {
    try {
      const candidates = await generateCandidates(inputData.intake);
      return { candidates };
    } catch (error) {
      if (error instanceof ModelUnreachableError) {
        return {
          modelFailure: { kind: "unreachable" as const, detail: error.message },
        };
      }
      if (error instanceof ModelOutputError) {
        return {
          modelFailure: { kind: "output" as const, detail: error.message },
        };
      }
      throw error;
    }
  },
});

const generateWorkflow = createWorkflow({
  id: "knell-generate",
  inputSchema: z.object({ intake: intakeSchema }),
  outputSchema: z.object({
    candidates: z.array(candidateSchema).optional(),
    modelFailure: modelFailureSchema.optional(),
  }),
})
  .then(generateStep)
  .commit();

export type CheckOutcome = {
  candidate: Candidate;
  pack: EvidencePack;
  served: CheckResult;
};

export async function runCheckWorkflow(
  candidate: Candidate,
): Promise<CheckOutcome> {
  const run = await checkWorkflow.createRun();
  const outcome = await run.start({ inputData: { candidate } });

  if (outcome.status === "failed") {
    throw outcome.error;
  }
  if (outcome.status !== "success") {
    throw new Error(`the check workflow stopped (${outcome.status})`);
  }

  const output = outcome.result;

  if (output.searchFailure !== undefined) {
    if (output.searchFailure.kind === "not_configured") {
      throw new SearchNotConfiguredError(output.searchFailure.detail);
    }
    throw new SearchBudgetExhaustedError(output.searchFailure.detail);
  }
  if (output.judgeFailure !== undefined) {
    if (output.judgeFailure.kind === "unreachable") {
      throw new ModelUnreachableError(output.judgeFailure.detail);
    }
    throw new ModelOutputError(output.judgeFailure.detail);
  }
  if (output.pack === undefined || output.served === undefined) {
    throw new Error("the check workflow returned an incomplete outcome");
  }

  return { candidate: output.candidate, pack: output.pack, served: output.served };
}

export async function runGenerateWorkflow(intake: Intake): Promise<Candidate[]> {
  const run = await generateWorkflow.createRun();
  const outcome = await run.start({ inputData: { intake } });

  if (outcome.status === "failed") {
    throw outcome.error;
  }
  if (outcome.status !== "success") {
    throw new Error(`the generate workflow stopped (${outcome.status})`);
  }

  const output = outcome.result;

  if (output.modelFailure !== undefined) {
    if (output.modelFailure.kind === "unreachable") {
      throw new ModelUnreachableError(output.modelFailure.detail);
    }
    throw new ModelOutputError(output.modelFailure.detail);
  }
  if (output.candidates === undefined) {
    throw new Error("the generate workflow returned no candidates");
  }

  return output.candidates;
}
