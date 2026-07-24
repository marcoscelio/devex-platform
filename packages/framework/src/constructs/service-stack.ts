/**
 * GoldenPathService — a shared CDK construct that encodes the "Golden Path" for
 * a service's infrastructure. Teams instantiate this instead of wiring Lambda +
 * API Gateway + tagging + per-environment config by hand, so every service is
 * consistent by construction (and the platform team improves all of them at
 * once by shipping a new construct version).
 *
 * Kept deliberately small for the PoC — the point is the shared abstraction and
 * standardized environment/tagging model, not exhaustive infra.
 */

import { Duration, Stack, Tags, type StackProps } from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import type { Construct } from "constructs";

export type DeployEnvironment = "sandbox" | "staging" | "production";

export interface GoldenPathServiceProps extends StackProps {
  /** Service name, e.g. "transactionify". */
  serviceName: string;
  /** Owning team, e.g. "payments". */
  team: string;
  /** Target environment for this stack instance. */
  environment: DeployEnvironment;
  /** Path to the Lambda handler asset (defaults to ./dist). */
  handlerAssetPath?: string;
  /** Handler entry, e.g. "index.handler". */
  handler?: string;
  runtime?: lambda.Runtime;
}

const MEMORY_BY_ENV: Record<DeployEnvironment, number> = {
  sandbox: 256,
  staging: 512,
  production: 1024,
};

export class GoldenPathService extends Stack {
  public readonly api: apigw.LambdaRestApi;

  constructor(scope: Construct, id: string, props: GoldenPathServiceProps) {
    super(scope, id, props);

    const fn = new lambda.Function(this, "Handler", {
      runtime: props.runtime ?? lambda.Runtime.PYTHON_3_11,
      handler: props.handler ?? "index.handler",
      code: lambda.Code.fromAsset(props.handlerAssetPath ?? "dist"),
      memorySize: MEMORY_BY_ENV[props.environment],
      timeout: Duration.seconds(30),
      environment: {
        SERVICE_NAME: props.serviceName,
        DEPLOY_ENV: props.environment,
      },
    });

    this.api = new apigw.LambdaRestApi(this, "Api", {
      handler: fn,
      deployOptions: { stageName: props.environment },
    });

    // Consistent tagging is what makes cost, ownership, and DORA attribution
    // comparable across every team's service.
    Tags.of(this).add("service", props.serviceName);
    Tags.of(this).add("team", props.team);
    Tags.of(this).add("environment", props.environment);
    Tags.of(this).add("managed-by", "goldenpath-framework");
  }
}
