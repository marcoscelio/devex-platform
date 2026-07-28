import { Workflow } from 'github-actions-workflow-ts';
export { NormalJob, Step, Workflow } from 'github-actions-workflow-ts';

/**
 * DORA / audit event types + factory — the TypeScript side of the shared
 * contract defined in `schemas/dora-event.schema.json`. The CLI (Python) emits
 * the identical shape; this is what makes DORA metrics comparable across teams
 * and languages.
 */
declare const SCHEMA_VERSION: "1.0.0";
type EventType = "change" | "deployment" | "incident" | "audit";
type Source = "cli" | "ci";
type Language = "python" | "go" | "clojure" | "typescript";
type Environment = "sandbox" | "staging" | "production";
type Outcome = "success" | "failure";
interface Actor {
    id: string;
    type: "human" | "machine";
}
interface ServiceRef {
    name: string;
    team: string;
    language: Language;
}
interface GitRef {
    sha?: string;
    branch?: string;
    prNumber?: number;
}
interface AuditRecord {
    who: string;
    what: string;
    when: string;
    why: string;
}
interface DoraEvent {
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
    dora?: {
        leadTimeSeconds?: number;
        timeToRestoreSeconds?: number;
    };
    audit: AuditRecord;
}
interface BuildEventInput {
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
declare function buildEvent(input: BuildEventInput): DoraEvent;

/**
 * The Golden Path PR pipeline generator.
 *
 * This is the "type-safe library that produces GitHub Actions" the challenge
 * asks for. It is built on `github-actions-workflow-ts`, so workflows are
 * authored against the real GitHub Actions schema with compile-time safety — a
 * service imports this, calls `generatePrPipeline({...})`, and gets a validated,
 * Stack-Aware workflow. No hand-written YAML, no per-team drift.
 *
 * PoC scope: only the PR pipeline is implemented (Small Tests -> Deployment).
 * The Integration pipeline is designed in the ADR and reuses these stages.
 */

type DeployEnvironment = "sandbox" | "staging" | "production";
interface PrPipelineOptions {
    service: string;
    team: string;
    language: Language;
    /** Deployment environments to promote through, in order. */
    environments?: DeployEnvironment[];
}
/**
 * Build the type-safe Workflow (a `github-actions-workflow-ts` instance).
 * Useful for tests/inspection; call `.workflow` for the raw object.
 */
declare function buildPrPipeline(options: PrPipelineOptions): Workflow;
/** Convenience: build + serialize to GitHub Actions YAML. */
declare function generatePrPipeline(options: PrPipelineOptions): string;

export { type Actor as A, type BuildEventInput as B, type DoraEvent as D, type DeployEnvironment, type Environment as E, type GitRef as G, type Language as L, type Outcome as O, type PrPipelineOptions, SCHEMA_VERSION as S, type AuditRecord as a, type EventType as b, buildPrPipeline, type ServiceRef as c, type Source as d, buildEvent as e, generatePrPipeline };
