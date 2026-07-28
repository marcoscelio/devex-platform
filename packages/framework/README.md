# @goldenpath/framework

The TypeScript CI/CD framework for LoanPro's DevEx platform. Provides shared AWS
CDK constructs, a **type-safe GitHub Actions generator**, and the DORA/audit
event contract — so services get a consistent, Stack-Aware pipeline without
hand-writing YAML.

## Install (from Git, via `pnpm`)

```bash
# No registry publish — install straight from the repo.
pnpm add "github:marcoscelio/devex-platform#path:packages/framework"
```

## Usage

Generate a PR pipeline (Stack-Aware Small Tests → Deployment):

```ts
// scripts/gen-workflow.ts
import { generatePrPipeline } from "@goldenpath/framework/workflows";
import { writeFileSync } from "node:fs";

const yaml = generatePrPipeline({
  service: "transactionify",
  team: "payments",
  language: "python",
});
writeFileSync(".github/workflows/pr.yml", yaml);
```

Consume the shared CDK construct:

```ts
import { GoldenPathService } from "@goldenpath/framework/constructs";

new GoldenPathService(app, "TransactionifyProd", {
  serviceName: "transactionify",
  team: "payments",
  environment: "production",
});
```

## Develop

```bash
pnpm install
pnpm build      # tsup → dist/
pnpm test       # vitest
pnpm typecheck
```
