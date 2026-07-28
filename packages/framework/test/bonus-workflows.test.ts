import { describe, expect, it } from 'vitest'
import { buildIntegrationPipeline, generateIntegrationPipeline } from '../src/workflows/integration-pipeline.js'
import { generateQReviewWorkflow } from '../src/workflows/q-review.js'

function jobs(wf: ReturnType<typeof buildIntegrationPipeline>) {
  return wf.workflow.jobs as Record<string, { needs?: string[]; steps: unknown[] }>
}

describe('Integration pipeline (merge to main)', () => {
  it('triggers on push to main and deploys production after validation', () => {
    const wf = buildIntegrationPipeline({ service: 'transactionify', team: 'payments', language: 'python' })
    const j = jobs(wf)
    expect(wf.workflow.on).toEqual({ push: { branches: ['main'] } })
    expect(Object.keys(j)).toEqual(['small-tests', 'deployment'])
    expect(j.deployment!.needs).toContain('small-tests')
  })

  it('deploys only production (not sandbox/staging) and emits DORA', () => {
    const yaml = generateIntegrationPipeline({ service: 'svc', team: 't', language: 'go' })
    expect(yaml).toContain('Deploy → production')
    expect(yaml).not.toContain('Deploy → sandbox')
    expect(yaml).toContain('Emit DORA deployment event')
  })
})

describe('Amazon Q Developer review workflow', () => {
  it('uses OIDC (no static secrets) and runs the Q review on the PR diff', () => {
    const yaml = generateQReviewWorkflow({ service: 'svc', awsRoleArn: 'arn:aws:iam::123:role/gha' })
    expect(yaml).toContain('id-token: write')
    expect(yaml).toContain('aws-actions/configure-aws-credentials@v4')
    expect(yaml).toContain('arn:aws:iam::123:role/gha')
    expect(yaml).toContain('q review')
  })
})
