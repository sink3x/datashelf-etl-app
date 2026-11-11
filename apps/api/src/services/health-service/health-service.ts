export type THealthCheck = (signal: AbortSignal) => Promise<void> | void

export type TCheckStatus = 'up' | 'down'

export interface IReadinessReport {
  status: 'ready' | 'not_ready'
  checks: Record<string, TCheckStatus>
}

const DEFAULT_CHECK_TIMEOUT_MS = 2_000

export class HealthService {
  private shuttingDown = false

  constructor(
    private readonly checks: Record<string, THealthCheck>,
    private readonly timeoutMs = DEFAULT_CHECK_TIMEOUT_MS,
  ) {}

  public markShuttingDown() {
    this.shuttingDown = true
  }

  public async readiness(): Promise<IReadinessReport> {
    const entries = await Promise.all(
      Object.entries(this.checks).map(async ([name, check]) => [name, await this.run(check)] as const),
    )
    const checks = Object.fromEntries(entries)
    const ready = !this.shuttingDown && entries.every(([, status]) => status === 'up')

    return { status: ready ? 'ready' : 'not_ready', checks }
  }

  private async run(check: THealthCheck): Promise<TCheckStatus> {
    const controller = new AbortController()
    let timer: NodeJS.Timeout | undefined

    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => {
        controller.abort()
        reject(new Error('health check timed out'))
      }, this.timeoutMs)
    })

    try {
      await Promise.race([Promise.resolve(check(controller.signal)), timeout])

      return 'up'
    } catch {
      return 'down'
    } finally {
      clearTimeout(timer)
    }
  }
}
