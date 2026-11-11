import { describe, expect, it, vi } from 'vitest'

import { createChartsComputedHandler } from '../../src/messaging/charts-computed-handler'
import type { TUpsertOutcome } from '../../src/repositories/chart-result-repository/chart-result-repository'
import { readFixture, silentLogger } from '../helpers'

const toMessage = (payload: unknown, raw = false) => ({
  content: Buffer.from(raw ? String(payload) : JSON.stringify(payload)),
  messageId: 'message-1',
  redelivered: false,
})

const createHandler = (outcome: TUpsertOutcome | Error = 'created') => {
  const upsertFromEvent = vi.fn(async () => {
    if (outcome instanceof Error) {
      throw outcome
    }

    return outcome
  })

  return {
    upsertFromEvent,
    handle: createChartsComputedHandler({ repository: { upsertFromEvent }, logger: silentLogger }),
  }
}

describe('charts computed handler', () => {
  it.each(['series-and-metric.json', 'frequency-and-grouped.json'])(
    'stores a valid event (%s) and acks',
    async (fixture) => {
      const event = readFixture(`valid/${fixture}`)
      const { handle, upsertFromEvent } = createHandler('created')

      await expect(handle(toMessage(event))).resolves.toBe('ack')
      expect(upsertFromEvent).toHaveBeenCalledOnce()
      expect(upsertFromEvent).toHaveBeenCalledWith(
        expect.objectContaining({ run_id: event.run_id, job: event.job, event_id: event.event_id }),
      )
    },
  )

  it('acks a duplicate delivery without failing', async () => {
    const event = readFixture('valid/series-and-metric.json')
    const { handle, upsertFromEvent } = createHandler('duplicate')

    await expect(handle({ ...toMessage(event), redelivered: true })).resolves.toBe('ack')
    expect(upsertFromEvent).toHaveBeenCalledOnce()
  })

  it.each(['legacy-payload.json', 'empty-charts.json', 'unknown-chart-type.json'])(
    'rejects a contract violation (%s) without touching the database',
    async (fixture) => {
      const { handle, upsertFromEvent } = createHandler()

      await expect(handle(toMessage(readFixture(`invalid/${fixture}`)))).resolves.toBe('reject')
      expect(upsertFromEvent).not.toHaveBeenCalled()
    },
  )

  it('rejects a body that is not JSON', async () => {
    const { handle, upsertFromEvent } = createHandler()

    await expect(handle(toMessage('{not json', true))).resolves.toBe('reject')
    expect(upsertFromEvent).not.toHaveBeenCalled()
  })

  it('rejects when the database write fails so the message is dead-lettered', async () => {
    const { handle } = createHandler(new Error('mongo down'))

    await expect(handle(toMessage(readFixture('valid/series-and-metric.json')))).resolves.toBe('reject')
  })
})
