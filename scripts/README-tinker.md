# The Tinker loop

Knell's graveyard stores every real verdict together with the exact evidence the
judge saw. That makes it a training set for the judge itself. The loop:

1. **Export** — dump the graveyard as chat-format JSONL:

   ```
   npx tsx scripts/export-judge-dataset.ts
   ```

   Writes `scripts/out/judge-dataset.jsonl` (one example per buried real
   verdict, `could_not_check` results skipped) and
   `scripts/out/judge-dataset.meta.json` (counts by verdict). Needs
   `MONGODB_URI` in `.env.local`; the folder is gitignored.

2. **Train** — fine-tune a LoRA adapter on Tinker:

   ```
   pip install tinker tinker-cookbook
   $env:TINKER_API_KEY = "tml-..."   # bash: export TINKER_API_KEY="tml-..."
   python scripts/tinker/train_judge.py
   ```

   Uses a seeded 90/10 split, LoRA rank 16, 3 epochs, and prints the saved
   adapter path. `BASE_MODEL` in the script must be a model Tinker serves.

3. **Evaluate** — score the adapter against the base model on the holdout:

   ```
   python scripts/tinker/eval_judge.py <tuned-model-path>
   ```

   Reports verdict agreement, strict-JSON-with-a-receipt rate and mean latency
   for BASE and TUNED.

4. **Ship only on a double win** — if TUNED beats BASE on both agreement and
   receipt validity, point the judge slot at the tuned model. Knell talks to
   any OpenAI-compatible chat completions endpoint, so serve the adapter
   behind that interface and set:

   ```
   JUDGE_BASE_URL=<endpoint serving the tuned adapter>
   JUDGE_MODEL=<tuned model name>
   JUDGE_API_KEY=<that endpoint's key>
   JUDGE_TEMPERATURE=0.2
   ```

   Otherwise leave production untouched and keep burying verdicts; the next
   export will be bigger.
