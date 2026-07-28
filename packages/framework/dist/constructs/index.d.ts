import { Stack, StackProps } from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

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

type DeployEnvironment = "sandbox" | "staging" | "production";
interface GoldenPathServiceProps extends StackProps {
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
declare class GoldenPathService extends Stack {
    readonly api: apigw.LambdaRestApi;
    constructor(scope: Construct, id: string, props: GoldenPathServiceProps);
}

export { type DeployEnvironment, GoldenPathService, type GoldenPathServiceProps };
