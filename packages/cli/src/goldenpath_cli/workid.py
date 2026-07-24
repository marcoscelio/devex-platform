"""Universal Work ID parsing and validation.

The Work ID (e.g. ``FIN-123``) is the thread that ties branches, commits, PR
titles, deployments, and incidents together — and it is the correlation key for
DORA metrics. This module is intentionally the most heavily tested unit in the
CLI because every other command depends on it.
"""

from __future__ import annotations

import re

# Two-or-more uppercase letters, a hyphen, one-or-more digits. e.g. FIN-123, OPS-7.
WORK_ID_RE = re.compile(r"[A-Z]{2,}-[0-9]+")
_EXACT_RE = re.compile(rf"^{WORK_ID_RE.pattern}$")


class InvalidWorkIdError(ValueError):
    """Raised when a required Work ID is missing or malformed."""


def is_valid(work_id: str) -> bool:
    """Return True if ``work_id`` is exactly a well-formed Work ID."""
    return bool(_EXACT_RE.match(work_id.strip()))


def extract(text: str) -> str | None:
    """Return the first Work ID found anywhere in ``text``, or None.

    Used to pull the Work ID out of a branch name (``feature/FIN-123-thing``)
    or a PR title (``FIN-123: add retries``).
    """
    match = WORK_ID_RE.search(text or "")
    return match.group(0) if match else None


def require(text: str, *, context: str = "input") -> str:
    """Return the Work ID contained in ``text`` or raise ``InvalidWorkIdError``."""
    found = extract(text)
    if found is None:
        raise InvalidWorkIdError(
            f"No Work ID found in {context}: {text!r}. "
            f"Expected something like FIN-123 (pattern: {WORK_ID_RE.pattern})."
        )
    return found


def branch_name(work_id: str, description: str) -> str:
    """Build a conventional branch name: ``feature/FIN-123-short-description``."""
    if not is_valid(work_id):
        raise InvalidWorkIdError(f"{work_id!r} is not a valid Work ID (e.g. FIN-123).")
    slug = re.sub(r"[^a-z0-9]+", "-", description.lower()).strip("-")
    return f"feature/{work_id}-{slug}" if slug else f"feature/{work_id}"
