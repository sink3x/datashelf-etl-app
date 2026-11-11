import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { chartsComputedEventSchema } from '../src'

const fixturesDir = path.resolve(__dirname, '../fixtures')

const loadFixtures = (kind: 'valid' | 'invalid') =>
  readdirSync(path.join(fixturesDir, kind)).map((file) => [
    file,
    JSON.parse(readFileSync(path.join(fixturesDir, kind, file), 'utf8')) as unknown,
  ])

describe('chartsComputedEventSchema', () => {
  it.each(loadFixtures('valid'))('accepts %s', (_file, payload) => {
    expect(chartsComputedEventSchema.safeParse(payload).success).toBe(true)
  })

  it.each(loadFixtures('invalid'))('rejects %s', (_file, payload) => {
    expect(chartsComputedEventSchema.safeParse(payload).success).toBe(false)
  })

  it('keeps chart-specific extra fields', () => {
    const [, payload] = loadFixtures('valid').find(([file]) => file === 'frequency-and-grouped.json')!
    const event = chartsComputedEventSchema.parse(payload)

    expect(event.charts[1]).toMatchObject({ top: { total_sales: 500.25 } })
  })
})
