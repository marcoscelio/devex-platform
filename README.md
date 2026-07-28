# Golden Path — DevEx Platform

Shared engineering tooling that homologates the development lifecycle for 10+
independent, polyglot teams — and produces **consistent, comparable DORA
metrics** regardless of a team's language. Built as a product: modular, versioned,
and adoptable without hand-holding.

## The ecosystem

| Component | Language | Distributed via | Role |
|-----------|----------|-----------------|------|
| **[CLI](packages/cli)** (`gp`) | Python | `uv` (from git) | Developer interface: git conventions, `init`, local validation, hooks |
| **[Framework](packages/framework)** (`@goldenpath/framework`) | TypeScript | `pnpm` (from git) | Shared CDK constructs + type-safe GitHub Actions generation |
| **[DORA contract](schemas/dora-event.schema.json)** | JSON Schema | — | The single source of truth both components emit into |

```
┌──────────────┐   emits   ┌───────────────────────┐   emits   ┌──────────────┐
│  CLI (uv)    │ ────────► │ dora-event.schema.json │ ◄──────── │ Framework(CI)│
│  gp init…    │           │  (single source of     │           │ PR pipeline  │
│  gp branch…  │           │   truth for DORA)      │           │ CDK deploy   │
└──────────────┘           └───────────────────────┘           └──────────────┘
        └────────────── consumed by a service repo (Transactionify) ───────────┘
```

## Quick start

Install both components directly from Git (no registry publish required):

```bash
# CLI
uv tool install "git+https://github.com/marcoscelio/devex-platform#subdirectory=packages/cli"

# Framework (inside a service repo)
pnpm add "github:marcoscelio/devex-platform#path:packages/framework"
```

Then, in a service repo:

```bash
gp init --service transactionify --team payments --language python
gp hooks install
gp branch FIN-123 "add retry logic"
# ...generate the pipeline from the framework, commit, open a PR.
```

## What's implemented (PoC scope)

- ✅ CLI with working commands (`init`, `standards check`, `branch`, `pr`, `hooks install`)
- ✅ Framework: type-safe **PR pipeline** generator (Small Tests → Deployment) + shared CDK construct
- ✅ Shared DORA/audit event contract, emitted by both components
- ✅ Unit tests **and property-based tests** for each component (hypothesis / fast-check)
- ✅ **Bonuses:** Integration pipeline (merge-to-main), Amazon Q Developer PR-review workflow, git hooks via the CLI, and AWS Kiro steering + specs (`.kiro/`)

## Repository layout

```
packages/cli/         Python CLI (Component A)
packages/framework/   TypeScript framework (Component B)
schemas/              Canonical DORA/audit event schema
docs/                 README assets, CONTRIBUTING, ADR
.kiro/                Kiro steering files + specs (spec-driven development)
```

## Documentation

- [Contribution Guidelines (Inner-Source)](docs/CONTRIBUTING.md)
- [ADR-001 — Architecture & Adoption](docs/adr/ADR-001-architecture.md)
