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

import { NormalJob, Step, Workflow } from "github-actions-workflow-ts";
import { dump } from "js-yaml";
import type { Language } from "../dora/event.js";

export type DeployEnvironment = "sandbox" | "staging" | "production";

export interface PrPipelineOptions {
  service: string;
  team: string;
  language: Language;
  /** Deployment environments to promote through, in order. */
  environments?: DeployEnvironment[];
  /** Trunk branch PRs target (default "main"). Some services use "master". */
  baseBranch?: string;
  /** Git spec used to run the Golden Path CLI in CI (`uvx --from <spec> gp …`). */
  cliInstallSpec?: string;
}

/** Stack-Aware: the Small Tests steps differ per language, the contract does not. */
function smallTestSteps(language: Language, cliInstallSpec?: string): Step[] {
  const setup: Record<Language, Step[]> = {
    python: [
      // uv (installed below) provisions Python per pyproject and runs the tests.
      new Step({ name: "Install dependencies", run: "uv sync --all-extras" }),
      new Step({ name: "Unit + Property-Based Tests", run: "uv run pytest -q" }),
    ],
    typescript: [
      new Step({ name: "Setup Node", uses: "actions/setup-node@v4", with: { "node-version": "20" } }),
      new Step({ name: "Install", run: "pnpm install --frozen-lockfile" }),
      new Step({ name: "Unit + Property-Based Tests", run: "pnpm test" }),
    ],
    go: [
      new Step({ name: "Setup Go", uses: "actions/setup-go@v5", with: { "go-version": "1.22" } }),
      new Step({ name: "Unit + Property-Based Tests", run: "go test ./... -count=1" }),
    ],
    clojure: [
      new Step({ name: "Setup Clojure", uses: "DeLaGuardo/setup-clojure@13.0", with: { cli: "latest" } }),
      new Step({ name: "Unit + Property-Based Tests", run: "clojure -M:test" }),
    ],
  };
  // The shared contract step: identical across every language, so the pipeline
  // (and therefore DORA) is comparable regardless of stack. When a platform CLI
  // install spec is provided, run it hermetically via uvx (no PATH setup needed).
  const standardsCheck = cliInstallSpec
    ? new Step({
        name: "API Contract Validation",
        run: `uvx --from "${cliInstallSpec}" gp standards check`,
      })
    : new Step({ name: "API Contract Validation", run: "gp standards check" });
  return [
    new Step({ name: "Checkout", uses: "actions/checkout@v4" }),
    // uv powers both the Golden Path CLI (via uvx) and Python builds.
    new Step({ name: "Install uv", uses: "astral-sh/setup-uv@v5" }),
    ...setup[language],
    standardsCheck,
  ];
}

export function smallTestsJob(language: Language, cliInstallSpec?: string): NormalJob {
  return new NormalJob("small-tests", { name: "Small Tests", "runs-on": "ubuntu-latest" }).addSteps(
    smallTestSteps(language, cliInstallSpec),
  );
}

export function deploymentJob(service: string, environments: DeployEnvironment[]): NormalJob {
  const steps: Step[] = [
    new Step({ name: "Checkout", uses: "actions/checkout@v4" }),
    new Step({ name: "Setup Node", uses: "actions/setup-node@v4", with: { "node-version": "20" } }),
    new Step({ name: "Install", run: "pnpm install --frozen-lockfile" }),
  ];
  for (const env of environments) {
    steps.push(
      new Step({ name: `Deploy → ${env}`, run: `pnpm cdk deploy ${service}-${env} --require-approval never` }),
    );
  }
  // Every pipeline emits DORA/audit events into the shared schema — the single
  // source of truth. Language-agnostic by construction.
  steps.push(
    new Step({
      name: "Emit DORA deployment event",
      run: "node ./node_modules/@goldenpath/framework/dist/ci/emit-deployment.js",
    }),
  );
  // Deploy only when the repo opts in (a `DEPLOY_ENABLED=true` repo variable),
  // so services without AWS credentials wired up skip the job cleanly.
  return new NormalJob("deployment", {
    name: "Deployment",
    "runs-on": "ubuntu-latest",
    if: "${{ vars.DEPLOY_ENABLED == 'true' }}",
  }).addSteps(steps);
}

/**
 * Build the type-safe Workflow (a `github-actions-workflow-ts` instance).
 * Useful for tests/inspection; call `.workflow` for the raw object.
 */
export function buildPrPipeline(options: PrPipelineOptions): Workflow {
  const environments = options.environments ?? ["sandbox", "staging", "production"];
  const smallTests = smallTestsJob(options.language, options.cliInstallSpec);
  const deployment = deploymentJob(options.service, environments).needs([smallTests]);

  return new Workflow(`${options.service}-pr`, {
    name: `${options.service} · PR Pipeline`,
    on: {
      pull_request: {
        branches: [options.baseBranch ?? "main"],
        types: ["opened", "synchronize", "reopened"],
      },
    },
  }).addJobs([smallTests, deployment]);
}

/** Convenience: build + serialize to GitHub Actions YAML. */
export function generatePrPipeline(options: PrPipelineOptions): string {
  const wf = buildPrPipeline(options);
  const header =
    `# GENERATED by @goldenpath/framework — do not edit by hand.\n` +
    `# Service: ${options.service} (team: ${options.team}, language: ${options.language})\n`;
  return header + dump(wf.workflow, { lineWidth: 120, noRefs: true });
}
