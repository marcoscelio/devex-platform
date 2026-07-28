# Tech — stack & conventions

## Components
- **CLI** — Python ≥3.11, Typer + Rich, `uv`-installable from Git (`packages/cli`,
  entry point `gp`). Tests: pytest + **hypothesis** (property-based).
- **Framework** — TypeScript (strict, ESM), built with `tsup`, distributed via
  `pnpm` from Git (`packages/framework`, `@goldenpath/framework`). GitHub Actions
  authored with **`github-actions-workflow-ts`** (type-safe), serialized with
  `js-yaml`. CDK constructs on `aws-cdk-lib` (peer). Tests: vitest + **fast-check**.
- **Contract** — JSON Schema draft-07 (`schemas/dora-event.schema.json`).

## Distribution (no registry publish)
- CLI: `uv tool install "git+https://github.com/marcoscelio/devex-platform#subdirectory=packages/cli"`.
- Framework: `pnpm add "github:marcoscelio/devex-platform#path:packages/framework"` — ships
  prebuilt `dist/` so installs are zero-config (no consumer build step).

## Pipelines (generated, never hand-written)
- **PR**: Small Tests (unit + PBT + API contract) → Deployment (Sandbox → Staging →
  Production via CDK).
- **Integration**: merge-to-main → validate → Production.
- **Q-review**: Amazon Q Developer automated review via GitHub OIDC.
- Every deploy emits a DORA/audit event into the shared schema.

## Commands
- CLI tests: `cd packages/cli && uv run pytest` (or `PYTHONPATH=src pytest`).
- Framework: `pnpm --filter @goldenpath/framework {build,test,typecheck}`.
