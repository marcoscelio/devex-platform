import {
  NormalJob,
  Step,
  Workflow,
  buildIntegrationPipeline,
  buildPrPipeline,
  buildQReviewWorkflow,
  deploymentJob,
  generateIntegrationPipeline,
  generatePrPipeline,
  generateQReviewWorkflow,
  smallTestsJob
} from "./chunk-ENC3UOKF.js";

// src/dora/event.ts
var SCHEMA_VERSION = "1.0.0";
function buildEvent(input) {
  const event = {
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
      why: input.workId
    }
  };
  if (input.git) event.git = input.git;
  if (input.environment) event.environment = input.environment;
  if (input.outcome) event.outcome = input.outcome;
  return event;
}
export {
  NormalJob,
  SCHEMA_VERSION,
  Step,
  Workflow,
  buildEvent,
  buildIntegrationPipeline,
  buildPrPipeline,
  buildQReviewWorkflow,
  deploymentJob,
  generateIntegrationPipeline,
  generatePrPipeline,
  generateQReviewWorkflow,
  smallTestsJob
};
//# sourceMappingURL=index.js.map