"""DORA / audit event emission.

The CLI and the TypeScript framework both emit events in the shape defined by
``schemas/dora-event.schema.json`` — that shared contract is what makes DORA
metrics comparable across teams and languages. For the PoC we append events as
JSON Lines to a local sink; in production this would target an event bus
(EventBridge / Kinesis) behind the same schema.
"""

from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

SCHEMA_VERSION = "1.0.0"
DEFAULT_SINK = Path(os.environ.get("GP_DORA_SINK", "events.dora.jsonl"))


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_event(
    *,
    event_type: str,
    work_id: str,
    actor_id: str,
    what: str,
    service_name: str = "unknown",
    team: str = "unknown",
    language: str = "python",
    actor_type: str = "human",
    git: dict[str, Any] | None = None,
    environment: str | None = None,
    outcome: str | None = None,
) -> dict[str, Any]:
    """Construct a schema-valid DORA/audit event (source=cli)."""
    now = _now_iso()
    event: dict[str, Any] = {
        "schemaVersion": SCHEMA_VERSION,
        "eventId": str(uuid.uuid4()),
        "eventType": event_type,
        "timestamp": now,
        "workId": work_id,
        "actor": {"id": actor_id, "type": actor_type},
        "source": "cli",
        "service": {"name": service_name, "team": team, "language": language},
        "audit": {"who": actor_id, "what": what, "when": now, "why": work_id},
    }
    if git:
        event["git"] = git
    if environment:
        event["environment"] = environment
    if outcome:
        event["outcome"] = outcome
    return event


def emit(event: dict[str, Any], *, sink: Path | None = None) -> Path:
    """Append ``event`` to the JSONL sink and return the sink path."""
    target = sink or DEFAULT_SINK
    with target.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(event, separators=(",", ":")) + "\n")
    return target
