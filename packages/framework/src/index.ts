/**
 * @goldenpath/framework — the TypeScript CI/CD framework for LoanPro's DevEx
 * platform. Exposes shared CDK constructs, a type-safe GitHub Actions generator,
 * and the DORA/audit event contract.
 */

export * from "./dora/index.js";
export * from "./workflows/index.js";
// Constructs are re-exported from their own subpath (`@goldenpath/framework/constructs`)
// to keep aws-cdk-lib fully optional for consumers that only want workflow/DORA APIs.
