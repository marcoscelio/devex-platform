import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/constructs/index.ts",
    "src/workflows/index.ts",
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  // Peer deps (cdk) and runtime deps are resolved by the consumer — don't bundle.
  external: ["aws-cdk-lib", "constructs", "github-actions-workflow-ts", "js-yaml"],
});
