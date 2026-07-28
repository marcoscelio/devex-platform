# Structure — repository layout & where things go

```
devex-platform/
├─ packages/
│  ├─ cli/                     Python CLI (Component A)
│  │  └─ src/goldenpath_cli/   cli.py · workid.py · dora.py · conventions.py
│  └─ framework/               TS framework (Component B)
│     └─ src/
│        ├─ workflows/         pr-pipeline · integration-pipeline · q-review
│        ├─ constructs/        GoldenPathService (CDK)
│        └─ dora/              event types + factory (mirrors the schema)
├─ schemas/dora-event.schema.json   the contract (single source of truth)
├─ docs/                       README · CONTRIBUTING (inner-source) · adr/
└─ .kiro/                      steering (this) + specs (spec-driven dev)
```

## Where changes go
- **New pipeline stage** → a builder in `packages/framework/src/workflows/` + a test.
- **New language** → add to the `Language` union (`src/dora/event.ts`) + a case in
  `smallTestSteps()` + the schema's `service.language` enum + the CLI's accepted values.
- **Schema change** → `schemas/dora-event.schema.json` + both emitters (`dora.py`,
  `dora/event.ts`) + bump `schemaVersion`.
- **New CLI command** → `packages/cli/src/goldenpath_cli/cli.py` + a pytest.

## Conventions
- CLI: Python type hints on public functions, `ruff` clean.
- Framework: strict TS, no `any`, ESM `.js` import specifiers.
- Every PR: Work ID (`FIN-###`) in branch + commits + title; two reviewers.
