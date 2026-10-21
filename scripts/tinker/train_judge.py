#!/usr/bin/env python3
"""Fine-tune the Knell judge on its own buried verdicts with Tinker.

Reads scripts/out/judge-dataset.jsonl (produced by
`npx tsx scripts/export-judge-dataset.ts`), keeps a seeded 90/10 split, trains
a LoRA adapter, and prints the path of the saved weights.

Requires:  pip install tinker tinker-cookbook
Env:       TINKER_API_KEY (see scripts/README-tinker.md)
"""

import json
import os
import random
import sys
from pathlib import Path

try:
    import tinker
    from tinker_cookbook import renderers
    from tinker_cookbook.supervised.data import conversation_to_datum
    from tinker_cookbook.supervised.types import TrainOnWhat
    from tinker_cookbook.tokenizer_utils import get_tokenizer
except ImportError as exc:  # pragma: no cover - environment check
    print("train_judge.py needs Tinker's SDK and cookbook:")
    print("  pip install tinker tinker-cookbook")
    print(f"({exc})")
    sys.exit(1)

REPO_ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = REPO_ROOT / "scripts" / "out" / "judge-dataset.jsonl"

# The base model must be one Tinker actually serves — check the service's model
# list before changing this (https://tinker-docs.thinkingmachines.ai).
BASE_MODEL = "meta-llama/Llama-3.3-70B-Instruct"
LORA_RANK = 16
EPOCHS = 3
HOLDOUT_FRACTION = 0.10
SPLIT_SEED = 20261021
BATCH_SIZE = 8
LEARNING_RATE = 1e-4
MAX_SEQ_LEN = 6144

ADAPTER_NAME = "knell-judge-v1"


def load_examples() -> list[dict]:
    if not DATASET_PATH.exists():
        print(f"No dataset at {DATASET_PATH.relative_to(REPO_ROOT)}.")
        print("Run: npx tsx scripts/export-judge-dataset.ts")
        sys.exit(1)

    examples = []
    with DATASET_PATH.open("r", encoding="utf-8") as handle:
        for line_no, line in enumerate(handle, start=1):
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            messages = record.get("messages")
            if not isinstance(messages, list) or len(messages) < 3:
                print(f"Skipping malformed line {line_no}.")
                continue
            examples.append(record)

    if len(examples) < 10:
        print(
            f"Only {len(examples)} usable verdicts — bury more checks before training."
        )
        sys.exit(1)
    return examples


def split_examples(examples: list[dict]) -> tuple[list[dict], list[dict]]:
    shuffled = list(examples)
    random.Random(SPLIT_SEED).shuffle(shuffled)
    holdout_count = max(1, int(len(shuffled) * HOLDOUT_FRACTION))
    return shuffled[holdout_count:], shuffled[:holdout_count]


def main() -> None:
    if not (os.environ.get("TINKER_API_KEY") or "").strip():
        print("TINKER_API_KEY is not set.")
        print("Export the key from your Tinker dashboard before running:")
        print("  PowerShell:  $env:TINKER_API_KEY = \"tml-...\"")
        print("  bash:        export TINKER_API_KEY=\"tml-...\"")
        sys.exit(1)

    examples = load_examples()
    train_examples, holdout_examples = split_examples(examples)
    print(
        f"Training on {len(train_examples)} verdicts, keeping {len(holdout_examples)} for eval."
    )

    tokenizer = get_tokenizer(BASE_MODEL)
    renderer = renderers.get_renderer("llama3", tokenizer)

    service_client = tinker.ServiceClient()
    training_client = service_client.create_lora_training_client(
        base_model=BASE_MODEL,
        rank=LORA_RANK,
    )

    datums = [
        conversation_to_datum(
            example["messages"],
            renderer,
            max_length=MAX_SEQ_LEN,
            train_on_what=TrainOnWhat.LAST_ASSISTANT_MESSAGE,
        )
        for example in train_examples
    ]

    rng = random.Random(SPLIT_SEED)
    for epoch in range(1, EPOCHS + 1):
        rng.shuffle(datums)
        for start in range(0, len(datums), BATCH_SIZE):
            batch = datums[start : start + BATCH_SIZE]
            training_client.forward_backward(batch, loss_fn="cross_entropy").result()
            training_client.optim_step(
                tinker.AdamParams(learning_rate=LEARNING_RATE)
            ).result()
        print(f"Epoch {epoch}/{EPOCHS} complete over {len(datums)} examples.")

    saved = training_client.save_weights_for_sampler(name=ADAPTER_NAME).result()
    model_path = getattr(saved, "path", None) or getattr(saved, "model_path", None)
    if not model_path:
        print("Training finished but the SDK returned no model path; check Tinker's dashboard.")
        sys.exit(1)

    print("")
    print(f"Saved adapter: {model_path}")
    print("Next: score it against the base model with:")
    print(f"  python scripts/tinker/eval_judge.py {model_path}")


if __name__ == "__main__":
    main()
