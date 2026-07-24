/**
 * DORA / audit event types + factory — the TypeScript side of the shared
 * contract defined in `schemas/dora-event.schema.json`. The CLI (Python) emits
 * the identical shape; this is what makes DORA metrics comparable across teams
 * and languages.
 */

export const SCHEMA_VERSION = "1.0.0" as const;

export type EventType = "change" | "deployment" | "incident" | "audit";
export type Source = "cli" | "ci";
export type Language = "python" | "go" | "clojure" | "typescript";
export type Environment = "sandbox" | "staging" | "production";
export type Outcome = "success" | "failure";

export interface Actor {
  id: string;
  type: "human" | "machine";
}

export interface ServiceRef {
  name: string;
  team: string;
  language: Language;
}

export interface GitRef {
  sha?: string;
  branch?: string;
  prNumber?: number;
}

export interface AuditRecord {
  who: string;
  what: string;
  when: string;
  why: string;
}

export interface DoraEvent {
  schemaVersion: typeof SCHEMA_VERSION;
  eventId: string;
  eventType: EventType;
  timestamp: string;
  workId: string;
  actor: Actor;
  source: Source;
  service: ServiceRef;
  git?: GitRef;
  environment?: Environment;
  outcome?: Outcome;
  dora?: { leadTimeSeconds?: number; timeToRestoreSeconds?: number };
  audit: AuditRecord;
}

export interface BuildEventInput {
  eventType: EventType;
  workId: string;
  actor: Actor;
  service: ServiceRef;
  what: string;
  timestamp: string;
  eventId: string;
  git?: GitRef;
  environment?: Environment;
  outcome?: Outcome;
}

/**
 * Build a schema-valid event (source=ci). Callers pass `timestamp`/`eventId`
 * explicitly so this stays pure and deterministic (easy to unit-test); the CI
 * runner injects real values from `github.run_id` and the current time.
 */
export function buildEvent(input: BuildEventInput): DoraEvent {
  const event: DoraEvent = {
    schemaVersion: SCHEMA_VERSION,
    eventId: input.eventId,
    eventType: input.eventType,
    timestamp: input.timestamp,
    workId: input.workId,
    actor: input.actor,
    source: "ci",
    service: input.service,
    audit: {
      who: input.actor.id,
      what: input.what,
      when: input.timestamp,
      why: input.workId,
    },
  };
  if (input.git) event.git = input.git;
  if (input.environment) event.environment = input.environment;
  if (input.outcome) event.outcome = input.outcome;
  return event;
}
