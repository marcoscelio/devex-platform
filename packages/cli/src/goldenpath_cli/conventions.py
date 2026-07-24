"""Golden Path conventions and the local `standards check` logic.

Kept language-agnostic on purpose: these checks are about *governance*
(conventions, PR template, project marker) rather than any single language's
build system, so the same command works for a Python, Go, Clojure, or TS repo.
"""

from __future__ import annotations

from pathlib import Path

PR_TEMPLATE = """## Summary
<!-- What does this change do? -->

## Work ID
<!-- REQUIRED. e.g. FIN-123 — must match the branch and PR title. -->

## Checklist
- [ ] Work ID present in branch, commits, and PR title
- [ ] Tests added/updated (unit + PBT where applicable)
- [ ] Two reviewers requested (Two-Reviewer rule)
- [ ] No secrets or credentials committed
"""


def check_repo(root: Path) -> list[str]:
    """Return a list of human-readable standards violations (empty == passing)."""
    violations: list[str] = []

    if not (root / ".goldenpath.toml").exists():
        violations.append("Missing .goldenpath.toml — run `gp init` to scaffold conventions.")

    pr_template = root / ".github" / "pull_request_template.md"
    if not pr_template.exists():
        violations.append("Missing .github/pull_request_template.md (standardized PR template).")

    return violations
