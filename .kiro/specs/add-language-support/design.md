# Design: Add a new language

## Approach
Language support is **data inside a stage**, not a new code path. The only seam is
`smallTestSteps(language)` in `packages/framework/src/workflows/pr-pipeline.ts`,
plus the shared `Language` union and the schema/CLI enums. The pipeline job graph,
the deployment stage, and the DORA event shape are untouched — that is what keeps
metrics comparable across languages.

## Touch points (bounded)
1. `packages/framework/src/dora/event.ts` — add `"rust"` to the `Language` union.
2. `packages/framework/src/workflows/pr-pipeline.ts` — add a `rust` case to the
   `setup` map in `smallTestSteps()` (setup-rust + `cargo test`).
3. `schemas/dora-event.schema.json` — add `"rust"` to `service.language` enum.
4. `packages/cli/src/goldenpath_cli/cli.py` — accept `rust` for `--language`.

## Consistency guarantee
The contract step (`gp standards check`) and the deployment/DORA-emit steps are
appended identically regardless of language, so `buildPrPipeline` output differs
only in the Small Tests setup steps.
