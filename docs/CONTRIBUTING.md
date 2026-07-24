# Contributing — Inner-Source Guidelines

The Golden Path platform is **inner-source**: any engineering team can propose
changes or extend it. This is how the platform team scales without becoming a
bottleneck — you contribute the capability your team needs, we curate and review.

## Principles

1. **The contract is sacred.** `schemas/dora-event.schema.json` is the single
   source of truth. Changes to it require a coordinated release of *both*
   components and a version bump — open an issue first.
2. **Convention over configuration.** New features should make the right thing
   easier, not add another knob teams must configure.
3. **Language support is additive.** Adding a language must not change the event
   shape or the pipeline contract — only the steps inside a stage.

## How to contribute

1. Open an issue describing the capability and the team need (include a Work ID).
2. Fork / branch using the CLI: `gp branch FIN-123 "add go support"`.
3. Make the change (see recipes below). Add tests — every PR needs them.
4. Open a PR with the Work ID in the title; request **two reviewers**.
5. A platform maintainer + a domain reviewer approve; CI must be green.

## Recipe: add a new language to the pipeline

Stack-Aware steps live in one place: `packages/framework/src/workflows/pr-pipeline.ts`.

1. Add your language to the `Language` union in `src/workflows/types.ts` and
   `src/dora/event.ts`.
2. Add a `setup` entry in `smallTestSteps()` with your build/test steps.
3. Add a test in `test/pr-pipeline.test.ts` asserting the steps **and** that the
   stage still ends with the shared `gp standards check` contract step.
4. Update the schema's `service.language` enum + the CLI's accepted values.

> A language PR touches ~4 files and needs no platform-team code — that is the
> scalability model working as intended.

## Recipe: add a new pipeline stage

1. Add a builder function beside `deploymentJob()` in `pr-pipeline.ts`.
2. Wire it into `buildPrPipeline()` with explicit `needs` dependencies.
3. Emit a DORA/audit event from the stage so it stays observable.
4. Test the job graph (names + `needs`) in `test/`.

## Recipe: evolve the DORA contract

1. Propose the field in an issue; get platform + a consumer team to agree.
2. Bump `schemaVersion` (semver) in the schema and both emitters.
3. Update both `build_event` (Python) and `buildEvent` (TS) together.
4. Note the migration in the PR description.

## Code standards

- **CLI (Python):** `ruff` clean, `pytest` green, type hints on public functions.
- **Framework (TS):** `strict` TypeScript, `vitest` green, no `any`.
- Every PR: Work ID in branch + commits + title; two reviewers; no secrets.
