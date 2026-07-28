# Golden Path CLI (`gp`)

The developer-facing interface for LoanPro's DevEx platform. Standardizes local
workflows — git conventions, project init, and shift-left validation — and emits
DORA/audit events into the shared schema.

## Install (from Git, via `uv`)

```bash
# Install the `gp` command directly from the repository — no registry publish.
uv tool install "git+https://github.com/marcoscelio/devex-platform#subdirectory=packages/cli"

# ...or, in a checkout:
uv tool install ./packages/cli
```

## Commands

| Command | Purpose |
|---------|---------|
| `gp init --service <s> --team <t> --language <l>` | Scaffold conventions (PR template, `.goldenpath.toml`). |
| `gp standards check` | Validate the repo against Golden Path standards (non-zero on failure). |
| `gp branch FIN-123 "short desc"` | Create a Work-ID-enforced branch + audit event. |
| `gp pr --title "FIN-123: ..."` | Validate PR title Work ID + record audit event. |
| `gp hooks install` | Install a pre-push hook that runs `gp standards check` (shift-left). |

## Develop

```bash
uv venv && uv pip install -e ".[dev]"
uv run pytest
```
