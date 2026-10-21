#!/usr/bin/env python3
"""Score the Tinker-fine-tuned Knell judge against the base model.

Uses the same seeded 90/10 split as train_judge.py, so the holdout examples
have never been trained on. Two numbers decide whether the adapter ships:

  - agreement:   % of holdout verdicts that match the buried real verdict
  - json+receipt: % of replies that are strict JSON and carry at least one
                  receipt URL copied from that example's own evidence

Ship rule: the tuned adapter replaces the production judge only when BOTH
numbers beat the base model. Anything less stays in scripts/tinker.

Usage:  python scripts/tinker/eval_judge.py <tuned-model-path>
Requires:  pip install tinker tinker-cookbook
Env:       TINKER_API_KEY
"""

import json
import os
import random
import re
import sys
import time
from pathlib import Path

try:
    import tinker
    from tinker_cookbook import renderers
    from tinker_cookbook.tokenizer_utils import get_tokenizer
except ImportError as exc:  # pragma: no cover - environment check
    print("eval_judge.py needs Tinker's SDK and cookbook:")
    print("  pip install tinker tinker-cookbook")
    print(f"({exc})")
    sys.exit(1)

REPO_ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = REPO_ROOT / "scripts" / "out" / "judge-dataset.jsonl"

BASE_MODEL = "meta-llama/Llama-3.3-70B-Instruct"
HOLDOUT_FRACTION = 0.10
SPLIT_SEED = 20261021
MAX_TOKENS = 512

URL_PATTERN = re.compile(r"https?://\S+")


def load_holdout() -> list[dict]:
    if not DATASET_PATH.exists():
        print(f"No dataset at {DATASET_PATH.relative_to(REPO_ROOT)}.")
        print("Run: npx tsx scripts/export-judge-dataset.ts")
        sys.exit(1)

    examples = []
    with DATASET_PATH.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            if isinstance(record.get("messages"), list) and len(record["messages"]) >= 3:
                examples.append(record)

    if len(examples) < 10:
        print("Not enough verdicts to evaluate — bury more checks first.")
        sys.exit(1)

    shuffled = list(examples)
    random.Random(SPLIT_SEED).shuffle(shuffled)
    holdout_count = max(1, int(len(shuffled) * HOLDOUT_FRACTION))
    return shuffled[:holdout_count]


def expected_verdict(example: dict) -> str | None:
    try:
        parsed = json.loads(example["messages"][-1]["content"])
    except (KeyError, TypeError, json.JSONDecodeError):
        return None
    verdict = parsed.get("verdict") if isinstance(parsed, dict) else None
    return verdict if isinstance(verdict, str) else None


def evidence_urls(example: dict) -> set[str]:
    user_content = ""
    for message in example["messages"]:
        if message.get("role") == "user":
            user_content = message.get("content", "")
            break
    return set(URL_PATTERN.findall(user_content))


def parse_reply(text: str) -> dict | None:
    trimmed = text.strip()
    if not trimmed.startswith("{"):
        start = trimmed.find("{")
        end = trimmed.rfind("}")
        if start == -1 or end <= start:
            return None
        trimmed = trimmed[start : end + 1]
    try:
        parsed = json.loads(trimmed)
    except json.JSONDecodeError:
        return None
    return parsed if isinstance(parsed, dict) else None


def score(client, renderer, tokenizer, holdout: list[dict]) -> dict:
    agreements = 0
    valid = 0
    total_seconds = 0.0
    scored = 0

    for example in holdout:
        expected = expected_verdict(example)
        if expected is None:
            continue
        scored += 1

        prompt = renderer.build_generation_prompt(example["messages"][:-1])
        params = tinker.SamplingParams(max_tokens=MAX_TOKENS, temperature=0)

        started = time.perf_counter()
        sampled = client.sample(
            prompt=prompt,
            num_samples=1,
            sampling_params=params,
        ).result()
        total_seconds += time.perf_counter() - started

        tokens = sampled.sequences[0].tokens
        reply = tokenizer.decode(tokens)
        parsed = parse_reply(reply)

        if parsed is not None and parsed.get("verdict") == expected:
            agreements += 1

        receipts = parsed.get("receiptUrls") if isinstance(parsed, dict) else None
        if (
            parsed is not None
            and isinstance(receipts, list)
            and any(url in evidence_urls(example) for url in receipts if isinstance(url, str))
        ):
            valid += 1

    if scored == 0:
        return {"agreement": 0.0, "valid": 0.0, "latency": 0.0, "scored": 0}

    return {
        "agreement": agreements / scored,
        "valid": valid / scored,
        "latency": total_seconds / scored,
        "scored": scored,
    }


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python scripts/tinker/eval_judge.py <tuned-model-path>")
        sys.exit(1)
    tuned_path = sys.argv[1].strip()

    if not (os.environ.get("TINKER_API_KEY") or "").strip():
        print("TINKER_API_KEY is not set — export your Tinker key first.")
        sys.exit(1)

    holdout = load_holdout()
    tokenizer = get_tokenizer(BASE_MODEL)
    renderer = renderers.get_renderer("llama3", tokenizer)

    service_client = tinker.ServiceClient()
    base_client = service_client.create_sampling_client(base_model=BASE_MODEL)
    tuned_client = service_client.create_sampling_client(model_path=tuned_path)

    print(f"Scoring {len(holdout)} holdout verdicts at temperature 0...")
    base = score(base_client, renderer, tokenizer, holdout)
    tuned = score(tuned_client, renderer, tokenizer, holdout)

    print("")
    print(f"{'model':<8} {'agreement':>10} {'json+receipt':>13} {'mean latency':>13}")
    for label, result in (("BASE", base), ("TUNED", tuned)):
        print(
            f"{label:<8} {result['agreement']:>9.1%} {result['valid']:>12.1%} "
            f"{result['latency']:>12.2f}s"
        )

    print("")
    if tuned["agreement"] > base["agreement"] and tuned["valid"] > base["valid"]:
        print("SHIP: the tuned adapter beats the base model on both numbers.")
        print("Point the judge slot at it (see scripts/README-tinker.md).")
    else:
        print("HOLD: the tuned adapter does not beat the base model on both numbers.")
        print("Keep the production judge as-is and collect more verdicts.")


if __name__ == "__main__":
    main()
