import { chartsComputedEventSchema } from '@datashelf/contracts'
import type { IChartResultRepository } from '@repositories/chart-result-repository/chart-result-repository'
import type { TLogger } from '@shared/logger'

import type { TMessageHandler } from './messaging.interfaces'

const MAX_LOGGED_ISSUES = 10

export interface IChartsComputedHandlerDependencies {
  repository: Pick<IChartResultRepository, 'upsertFromEvent'>
  logger: TLogger
}

export const createChartsComputedHandler =
  ({ repository, logger }: IChartsComputedHandlerDependencies): TMessageHandler =>
  async (message) => {
    const context = { messageId: message.messageId, redelivered: message.redelivered }
    let payload: unknown

    try {
      payload = JSON.parse(message.content.toString('utf8'))
    } catch {
      logger.warn(context, 'rejecting charts computed message: body is not valid JSON')

      return 'reject'
    }

    const parsed = chartsComputedEventSchema.safeParse(payload)

    if (!parsed.success) {
      const issues = parsed.error.issues
        .slice(0, MAX_LOGGED_ISSUES)
        .map(({ path, message: issueMessage }) => ({ path: path.join('.'), message: issueMessage }))

      logger.warn({ ...context, issues }, 'rejecting charts computed message: contract validation failed')

      return 'reject'
    }

    const event = parsed.data
    const eventContext = { ...context, eventId: event.event_id, runId: event.run_id, job: event.job }

    try {
      const outcome = await repository.upsertFromEvent(event)

      logger.info({ ...eventContext, outcome }, 'charts computed event stored')

      return 'ack'
    } catch (error) {
      logger.error({ ...eventContext, err: error }, 'failed to store charts computed event')

      return 'reject'
    }
  }
