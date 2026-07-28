# Product — Golden Path DevEx Platform

Always-included steering context for AI-assisted (Kiro) development and reviews.

## What this is
Shared engineering tooling — the company's **"Golden Path"** — that homologates the
development lifecycle across 10+ independent, polyglot teams (Python, Go, Clojure,
TypeScript) and produces **consistent, comparable DORA metrics**.

## Two components, one ecosystem
- **CLI** (`gp`, Python, `uv`): the developer interface — git conventions, project
  `init`, local validation, git hooks. Emits DORA/audit events.
- **Framework** (`@goldenpath/framework`, TypeScript, `pnpm`): shared AWS CDK
  constructs + type-safe GitHub Actions generation (PR, Integration, Q-review).
- **Contract**: `schemas/dora-event.schema.json` — the single source of truth both
  components emit into. Language is metadata; the event shape never changes.

## Principles (enforce these in any change)
- **Convention over configuration** — the golden path is the path of least resistance.
- **The contract is sacred** — schema changes require both emitters + a version bump.
- **Language support is additive** — new languages change steps inside a stage, never
  the pipeline/event contract.
- **Inner-source** — teams extend via PRs against documented extension points; the
  platform team curates, it is never a bottleneck.
