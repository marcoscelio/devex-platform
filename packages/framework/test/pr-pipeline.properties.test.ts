import { describe, expect, it } from 'vitest'
import fc from 'fast-check'
import { buildEvent, buildPrPipeline, generatePrPipeline, type Language } from '../src/index.js'

const LANGUAGES: Language[] = ['python', 'go', 'clojure', 'typescript']

function jobs(wf: ReturnType<typeof buildPrPipeline>) {
  return wf.workflow.jobs as Record<
    string,
    { needs?: string[]; steps: Array<{ name?: string; run?: string; uses?: string }> }
  >
}

// A generator of safe, non-empty service/team identifiers.
const ident = fc.stringMatching(/^[a-z][a-z0-9-]{0,20}$/)

describe('PR pipeline — invariants across every language (property-based)', () => {
  it('always produces exactly small-tests -> deployment, needs-linked', () => {
    fc.assert(
      fc.property(fc.constantFrom(...LANGUAGES), ident, ident, (language, service, team) => {
        const j = jobs(buildPrPipeline({ service, team, language }))
        expect(Object.keys(j)).toEqual(['small-tests', 'deployment'])
        expect(j.deployment!.needs).toContain('small-tests')
      }),
    )
  })

  it('small-tests always ends with the shared standards-check contract step', () => {
    fc.assert(
      fc.property(fc.constantFrom(...LANGUAGES), (language) => {
        const j = jobs(buildPrPipeline({ service: 's', team: 't', language }))
        const steps = j['small-tests']!.steps.map((s) => s.run ?? s.uses)
        expect(steps.at(-1)).toBe('gp standards check')
      }),
    )
  })

  it('generated YAML is always valid GitHub Actions (runs-on, never runsOn)', () => {
    fc.assert(
      fc.property(fc.constantFrom(...LANGUAGES), ident, ident, (language, service, team) => {
        const yaml = generatePrPipeline({ service, team, language })
        expect(yaml).toContain('runs-on: ubuntu-latest')
        expect(yaml).not.toContain('runsOn')
      }),
    )
  })
})

describe('DORA event — invariants (property-based)', () => {
  const workId = fc.stringMatching(/^[A-Z]{2,}-[0-9]{1,6}$/)

  it('audit record always mirrors actor + workId, with a fixed schema version', () => {
    fc.assert(
      fc.property(workId, fc.string(), (wid, actorId) => {
        const event = buildEvent({
          eventType: 'deployment',
          workId: wid,
          actor: { id: actorId, type: 'machine' },
          service: { name: 'svc', team: 'team', language: 'go' },
          what: 'deployed',
          timestamp: '2026-01-01T00:00:00.000Z',
          eventId: 'e',
        })
        expect(event.schemaVersion).toBe('1.0.0')
        expect(event.source).toBe('ci')
        expect(event.audit.who).toBe(actorId)
        expect(event.audit.why).toBe(wid)
      }),
    )
  })
})
