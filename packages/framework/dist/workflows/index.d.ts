import { Workflow, NormalJob } from 'github-actions-workflow-ts';
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
declare function smallTestsJob(language: Language): NormalJob;
declare function deploymentJob(service: string, environments: DeployEnvironment[]): NormalJob;
/**
 * Build the type-safe Workflow (a `github-actions-workflow-ts` instance).
 * Useful for tests/inspection; call `.workflow` for the raw object.
 */
declare function buildPrPipeline(options: PrPipelineOptions): Workflow;
/** Convenience: build + serialize to GitHub Actions YAML. */
declare function generatePrPipeline(options: PrPipelineOptions): string;

/**
 * The Golden Path Integration pipeline generator (bonus).
 *
 * Triggered when code merges into `main`. It runs final validation and then
 * deploys to Production via CDK — reusing the exact same job builders as the PR
 * pipeline, so the two pipelines stay consistent and DORA stays continuous
 * across both (same event schema on every deploy).
 */

interface IntegrationPipelineOptions {
    service: string;
    team: string;
    language: Language;
}
/** Build the type-safe Integration Workflow (merge-to-main → validate → prod deploy). */
declare function buildIntegrationPipeline(options: IntegrationPipelineOptions): Workflow;
/** Convenience: build + serialize to GitHub Actions YAML. */
declare function generateIntegrationPipeline(options: IntegrationPipelineOptions): string;

/**
 * Amazon Q Developer automated PR-review workflow generator (bonus).
 *
 * Generates a GitHub Actions workflow that runs Amazon Q Developer's automated
 * code review on every pull request, using OIDC to assume an AWS role (no
 * long-lived secrets) and the Amazon Q Developer CLI to review the diff.
 *
 * This is a scaffold: it requires an AWS account with Amazon Q Developer enabled
 * and an IAM role trusting GitHub's OIDC provider (pass its ARN as `awsRoleArn`).
 */

interface QReviewOptions {
    service: string;
    /** ARN of the IAM role GitHub Actions assumes via OIDC. */
    awsRoleArn: string;
    awsRegion?: string;
}
declare function buildQReviewWorkflow(options: QReviewOptions): Workflow;
/** Convenience: build + serialize to GitHub Actions YAML. */
declare function generateQReviewWorkflow(options: QReviewOptions): string;

export { type Actor as A, type BuildEventInput as B, type DoraEvent as D, type DeployEnvironment, type Environment as E, type GitRef as G, type IntegrationPipelineOptions, type Language as L, type Outcome as O, type PrPipelineOptions, type QReviewOptions, SCHEMA_VERSION as S, type AuditRecord as a, type EventType as b, buildIntegrationPipeline, buildPrPipeline, buildQReviewWorkflow, type ServiceRef as c, type Source as d, deploymentJob, buildEvent as e, generateIntegrationPipeline, generatePrPipeline, generateQReviewWorkflow, smallTestsJob };
