# Spec: Add a new language to the Golden Path

> Kiro spec-driven development. Example feature: add **Rust** support so Rust
> service teams get the same PR pipeline and DORA consistency as everyone else.

## Requirements (EARS-style)

### R1 — Stack-Aware test steps
- WHEN a service declares `language = "rust"`, the generated PR pipeline SHALL
  include Rust-appropriate Small Tests steps (toolchain setup + `cargo test`).

### R2 — Contract unchanged
- The event schema and pipeline job graph SHALL NOT change when a language is added.
  A Rust team's DORA events SHALL be byte-shape-identical to a Python team's.

### R3 — CLI acceptance
- The CLI SHALL accept `--language rust` in `gp init` and record it in `.goldenpath.toml`.

### R4 — Additive, inner-source
- Adding Rust SHALL require changes to a bounded, documented set of files and no
  platform-team-only code, and SHALL be covered by tests.

## Acceptance
- A generated `rust` pipeline runs `cargo test` in Small Tests and still ends with
  the shared `gp standards check` step; deployment + DORA-emit stages are unchanged.
