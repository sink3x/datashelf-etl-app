import type { TLogger } from '@shared/logger'
import type { Connection } from 'mongoose'
import mongoose from 'mongoose'

export interface IMongodbConnectionOptions {
  uri: string
  dbName: string
  logger: TLogger
}

const SERVER_SELECTION_TIMEOUT_MS = 10_000
const CONNECTED_STATE = 1

export class MongodbConnection {
  public readonly connection: Connection
  private readonly logger: TLogger

  constructor(private readonly options: IMongodbConnectionOptions) {
    this.connection = mongoose.createConnection()
    this.logger = options.logger.child({ component: 'mongodb' })

    this.connection.on('disconnected', () => this.logger.warn('mongodb disconnected'))
    this.connection.on('reconnected', () => this.logger.info('mongodb reconnected'))
    this.connection.on('error', (error) => this.logger.error({ err: error }, 'mongodb connection error'))
  }

  public async connect() {
    await this.connection.openUri(this.options.uri, {
      dbName: this.options.dbName,
      autoIndex: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
    })

    this.logger.info({ dbName: this.options.dbName }, 'mongodb connected')
  }

  public async ping() {
    if (this.connection.readyState !== CONNECTED_STATE || !this.connection.db) {
      throw new Error('mongodb is not connected')
    }

    await this.connection.db.admin().ping()
  }

  public async close() {
    await this.connection.close()
    this.logger.info('mongodb connection closed')
  }
}
