# Tasks: Add a new language (Rust)

Discrete, individually-verifiable steps. Each maps to requirements in `requirements.md`.

- [ ] 1. Add `"rust"` to the `Language` union in `src/dora/event.ts`. _(R2)_
- [ ] 2. Add a `rust` entry to `smallTestSteps()` setup map: `actions-rust-lang/setup-rust-toolchain`
      + `cargo test`. _(R1)_
- [ ] 3. Add `"rust"` to `service.language` enum in `schemas/dora-event.schema.json`. _(R2)_
- [ ] 4. Accept `rust` in the CLI `gp init --language` help/values. _(R3)_
- [ ] 5. Add a vitest case: `buildPrPipeline({language:'rust'})` includes `cargo test`
      and still ends Small Tests with `gp standards check`. _(R1, R4)_
- [ ] 6. Add a fast-check case: `rust` upholds the same job-graph invariants as other
      languages. _(R2, R4)_
- [ ] 7. Update `docs/CONTRIBUTING.md` language list. _(R4)_

**Definition of done:** `pnpm --filter @goldenpath/framework test` green; generated
`rust` pipeline verified; no change to the event schema shape or job graph.
