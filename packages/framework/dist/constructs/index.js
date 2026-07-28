// src/constructs/service-stack.ts
import { Duration, Stack, Tags } from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
var MEMORY_BY_ENV = {
  sandbox: 256,
  staging: 512,
  production: 1024
};
var GoldenPathService = class extends Stack {
  api;
  constructor(scope, id, props) {
    super(scope, id, props);
    const fn = new lambda.Function(this, "Handler", {
      runtime: props.runtime ?? lambda.Runtime.PYTHON_3_11,
      handler: props.handler ?? "index.handler",
      code: lambda.Code.fromAsset(props.handlerAssetPath ?? "dist"),
      memorySize: MEMORY_BY_ENV[props.environment],
      timeout: Duration.seconds(30),
      environment: {
        SERVICE_NAME: props.serviceName,
        DEPLOY_ENV: props.environment
      }
    });
    this.api = new apigw.LambdaRestApi(this, "Api", {
      handler: fn,
      deployOptions: { stageName: props.environment }
    });
    Tags.of(this).add("service", props.serviceName);
    Tags.of(this).add("team", props.team);
    Tags.of(this).add("environment", props.environment);
    Tags.of(this).add("managed-by", "goldenpath-framework");
  }
};
export {
  GoldenPathService
};
//# sourceMappingURL=index.js.map